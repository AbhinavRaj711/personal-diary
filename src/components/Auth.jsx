import React, { useState } from 'react';
import { loadJSONData, saveJSONData } from '../utils/storage';

export default function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Fields cannot be empty.');
      return;
    }

    const data = loadJSONData();

    if (isRegistering) {
      if (data.users[username]) {
        setError('Username already exists.');
        return;
      }
      data.users[username] = password; 
      data.entries[username] = [];     
      saveJSONData(data);
      alert('Registration successful! Please log in.');
      setIsRegistering(false);
    } else {
      if (data.users[username] && data.users[username] === password) {
        onLoginSuccess(username);
      } else {
        setError('Invalid username or password.');
      }
    }
    setPassword('');
  };

  return (
    <div className="card auth-container">
      <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {isRegistering ? 'Create an Account' : 'Welcome Back'}
      </h3>
      
      {error && <div className="error-msg">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">
          {isRegistering ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setIsRegistering(!isRegistering)} className="btn btn-link">
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}