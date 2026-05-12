import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import ALL original CSS files in the exact same order as the original index.html
import './css/styles.css';
import './css/intro-screen.css';
import './css/menu-screen.css';
import './css/game-screen.css';
import './css/battle-screen.css';
import './css/goal-screen.css';
import './css/stats-screen.css';
import './css/game-over-screen.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
