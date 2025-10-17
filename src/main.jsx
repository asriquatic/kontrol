import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// BARIS KUNCI: Baris ini memberitahu Vite untuk menyertakan semua styling
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);