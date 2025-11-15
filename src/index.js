import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyTheme } from './theme';

// Apply saved theme as early as possible to avoid flash
try {
  const saved = localStorage.getItem('appPreferences');
  const theme = saved ? JSON.parse(saved).theme || 'light' : 'light';
  applyTheme(theme);
} catch (_) {
  applyTheme('light');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
