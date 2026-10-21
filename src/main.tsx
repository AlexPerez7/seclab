import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter: funciona en GitHub Pages sin configurar redirects del servidor. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
