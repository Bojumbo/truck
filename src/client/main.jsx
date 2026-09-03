import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Доступне оновлення. Оновити?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('✅ Додаток готовий до офлайн-роботи');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
