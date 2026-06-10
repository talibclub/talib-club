import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AudioProvider } from './context/AudioContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AudioProvider>
        <App />
      </AudioProvider>
    </BrowserRouter>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });

  // Automatically refresh page to load new version once service worker updates and activates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
