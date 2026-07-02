import React, { useState, useEffect, useMemo } from 'react';
import { loadJSONData, saveJSONData } from '../utils/storage';

const MOODS = ['happy', 'sad', 'confused', 'excited', 'angry'];

export default function Dashboard({ username, onLogout }) {
  const [entries, setEntries] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('happy');
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // View State
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load Data
  useEffect(() => {
    const data = loadJSONData();
    setEntries(data.entries[username] || []);
  }, [username]);

  // Handle Image Upload (Convert to Base64 Text)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit warning
        alert("File is too large! Please choose an image under 2MB for local storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Save or Update Entry
  const handleSaveEntry = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const data = loadJSONData();
    let userEntries = data.entries[username] || [];
    const timestamp = Date.now();

    if (editingId) {
      userEntries = userEntries.map(entry => 
        entry.id === editingId 
          ? { ...entry, title, content, mood, image: image || entry.image, date: new Date().toLocaleDateString() + ' (Edited)' }
          : entry
      );
      setEditingId(null);
    } else {
      const newEntry = { 
        id: timestamp, 
        timestamp: timestamp, // Used for exact date filtering
        title, 
        content, 
        mood, 
        image, 
        date: new Date().toLocaleDateString() 
      };
      userEntries.unshift(newEntry);
      setSelectedEntryId(newEntry.id);
    }

    data.entries[username] = userEntries;
    saveJSONData(data);
    setEntries(userEntries);
    resetForm();
  };

  const resetForm = () => {
    setTitle(''); setContent(''); setMood('happy'); setImage(null); setEditingId(null);
  };

  const startEdit = (entry) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || 'happy');
    setImage(entry.image || null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    const data = loadJSONData();
    const updatedEntries = data.entries[username].filter(entry => entry.id !== id);
    data.entries[username] = updatedEntries;
    saveJSONData(data);
    setEntries(updatedEntries);
    if (selectedEntryId === id) setSelectedEntryId('');
  };

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const total = entries.length;
    // Get unique days (ignoring time)
    const uniqueDaysSet = new Set(entries.map(e => new Date(e.timestamp || e.id).toDateString()));
    const totalDays = uniqueDaysSet.size;
    
    return { total, totalDays };
  }, [entries]);

  // --- Filter Logic ---
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryTime = entry.timestamp || entry.id; // Fallback for older entries
      if (startDate && entryTime < new Date(startDate).getTime()) return false;
      // Add 24 hours to end date to include the whole day
      if (endDate && entryTime > new Date(endDate).getTime() + 86400000) return false;
      return true;
    });
  }, [entries, startDate, endDate]);

  const selectedEntry = filteredEntries.find(e => e.id === Number(selectedEntryId));

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Statistics Panel */}
      <div className="stats-container">
        <div className="stat-box">
          <span>Total Entries</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-box">
          <span>Days Journaled</span>
          <strong>{stats.totalDays}</strong>
        </div>
        <div className="stat-box">
          <span>Current Streak</span>
          {/* Simple streak placeholder - complex streak logic requires a robust date engine */}
          <strong>{stats.totalDays > 0 ? "🔥 Keep going!" : "Start today!"}</strong>
        </div>
      </div>

      {/* 2. Writing Area (Dynamic Background based on Mood) */}
      <div className={`card mood-${mood}`} style={{ marginBottom: '2rem' }}>
        <header className="header">
          <h3>Welcome, {username} 📖</h3>
          <button onClick={onLogout} className="btn btn-danger">Logout</button>
        </header>

        <form onSubmit={handleSaveEntry}>
          <h4>{editingId ? 'Edit Entry' : 'How are you feeling today?'}</h4>
          
          <div className="mood-selector">
            {MOODS.map(m => (
              <button 
                key={m} type="button" 
                className={`mood-btn ${mood === m ? 'active' : ''}`}
                onClick={() => setMood(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className="form-group">
            <input type="text" placeholder="Title your thoughts..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <textarea placeholder="Write your diary entry..." value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          
          <div className="form-group">
            <label>Attach an Image (Optional):</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: 'transparent', border: 'none', padding: 0 }} />
            {image && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '5px' }}>✓ Image attached</p>}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Entry' : 'Save Entry'}</button>
            {editingId && <button type="button" className="btn" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* 3. Reading & Filtering Area */}
      <div className="card">
        <h4>Look Back in Time</h4>
        
        {/* Date Filter Bar */}
        <div className="filter-bar">
          <div>
            <label style={{ margin: 0, fontSize: '0.8rem' }}>From Date:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ margin: 0, fontSize: '0.8rem' }}>To Date:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ marginTop: '1.2rem', padding: '0.5rem 1rem' }}>Clear Filters</button>
        </div>

        {/* Entries Dropdown */}
        {filteredEntries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No entries found for this time period.</p>
        ) : (
          <div className="form-group">
            <select value={selectedEntryId} onChange={(e) => setSelectedEntryId(Number(e.target.value))}>
              <option value="" disabled>-- Select a diary entry to read --</option>
              {filteredEntries.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.date} : {entry.title} ({entry.mood || 'neutral'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selected Entry Display */}
        {selectedEntry && (
          <div className={`entry-card mood-${selectedEntry.mood || 'happy'}`} style={{ marginTop: '1.5rem' }}>
            <span className="entry-date">{selectedEntry.date}</span>
            {selectedEntry.mood && <span className="entry-mood-badge">Mood: {selectedEntry.mood}</span>}
            <h5 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{selectedEntry.title}</h5>
            
            {/* Display Image if it exists */}
            {selectedEntry.image && <img src={selectedEntry.image} alt="Diary Attachment" className="uploaded-image" />}
            
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedEntry.content}</p>
            
            <div className="entry-actions">
              <button onClick={() => startEdit(selectedEntry)} className="btn" style={{ border: '1px solid #cbd5e0' }}>Edit</button>
              <button onClick={() => handleDelete(selectedEntry.id)} className="btn btn-danger">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}