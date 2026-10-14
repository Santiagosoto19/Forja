import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppStateProvider } from './context/AppState.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import App from './App.jsx'
import './index.css'

function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // LibreWolf u otros pueden bloquear el SW; la app sigue en modo web.
    })
  })
}

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
