import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StationsProvider } from './contexts/StationsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StationsProvider>
      <App />
    </StationsProvider>
  </StrictMode>,
)
