import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { basePath } from './context/constants.ts'
import { checkAndClearCache } from './utils/cache-cleaner'
import { QueryProvider } from './components/QueryProvider'
import { initWebVitals } from './utils/web-vitals'

// ✅ Initialize Web Vitals Monitoring
initWebVitals()

// ✅ PRIORITY 1: Cache Management System
// Check for new builds and clear cache if needed
checkAndClearCache().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter basename={basePath}>
        <QueryProvider>
          <App />
        </QueryProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
