import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { basePath } from './context/constants.ts'
import SystemSetupChecker from '@/components/auth/SystemSetupChecker'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <SystemSetupChecker>
        <App />
      </SystemSetupChecker>
    </BrowserRouter>
  </StrictMode>,
)
