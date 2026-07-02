import React, { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <>
      <h1>📔 Personal Journal</h1>
      {currentUser ? (
        <Dashboard username={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <Auth onLoginSuccess={(username) => setCurrentUser(username)} />
      )}
    </>
  );
}

export default App;