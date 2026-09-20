import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// HashRouter, not BrowserRouter: this is a static S3 + CloudFront deployment
// under /steinhoist/ with no server-side rewrite rule, so a hard refresh or
// deep link on any client-side route must resolve to the same index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
