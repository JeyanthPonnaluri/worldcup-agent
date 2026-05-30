import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor to support dynamic external backends (e.g. Render/Koyeb)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
if (BACKEND_URL) {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === "string" && (url.startsWith("/api") || url.startsWith("/auth"))) {
      url = `${BACKEND_URL}${url}`;
    }
    return originalFetch(url, options);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

