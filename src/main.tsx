import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Minimal client-side deterrence (not a security boundary)
if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
  document.addEventListener('contextmenu', (event) => event.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
      e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
