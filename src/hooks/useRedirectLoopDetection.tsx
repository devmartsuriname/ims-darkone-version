import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';

interface RedirectLogEntry {
  timestamp: string;
  from: string;
  to: string;
  reason: string;
  authState: 'authenticated' | 'unauthenticated' | 'loading';
}

/**
 * Redirect Loop Detection Hook
 * Monitors navigation and detects potential redirect loops
 */
export const useRedirectLoopDetection = () => {
  const [redirectHistory, setRedirectHistory] = useState<RedirectLogEntry[]>([]);
  const [loopDetected, setLoopDetected] = useState(false);
  const location = useLocation();
  const { isAuthenticated, loading } = useAuthContext();
  
  const MAX_REDIRECTS = 5;
  const LOOP_DETECTION_WINDOW = 3000; // 3 seconds

  useEffect(() => {
    const now = new Date().toISOString();
    const currentPath = location.pathname + location.search;
    
    // Add to redirect history
    const newEntry: RedirectLogEntry = {
      timestamp: now,
      from: redirectHistory[redirectHistory.length - 1]?.to || 'initial',
      to: currentPath,
      reason: determineRedirectReason(currentPath, isAuthenticated, loading),
      authState: loading ? 'loading' : (isAuthenticated ? 'authenticated' : 'unauthenticated')
    };

    setRedirectHistory(prev => {
      const updated = [...prev, newEntry];
      
      // Keep only recent history (last 10 entries)
      if (updated.length > 10) {
        updated.shift();
      }

      // Check for redirect loop
      const recentRedirects = updated.filter(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        const currentTime = new Date(now).getTime();
        return currentTime - entryTime < LOOP_DETECTION_WINDOW;
      });

      // Detect loop: same path visited multiple times in short period
      const pathCounts = recentRedirects.reduce((acc, entry) => {
        acc[entry.to] = (acc[entry.to] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hasLoop = Object.values(pathCounts).some(count => count >= MAX_REDIRECTS);
      
      if (hasLoop && !loopDetected) {
        console.error('🔴 REDIRECT LOOP DETECTED!', {
          history: recentRedirects,
          pathCounts
        });
        setLoopDetected(true);
      }

      return updated;
    });
  }, [location.pathname, location.search]);

  return {
    redirectHistory,
    loopDetected,
    clearHistory: () => {
      setRedirectHistory([]);
      setLoopDetected(false);
    }
  };
};

function determineRedirectReason(
  path: string, 
  isAuthenticated: boolean, 
  loading: boolean
): string {
  if (loading) return 'checking authentication';
  
  if (path.startsWith('/auth/')) {
    if (isAuthenticated) return 'authenticated user on public route';
    return 'unauthenticated user accessing auth page';
  }
  
  if (path === '/setup') {
    return 'initial system setup';
  }
  
  if (path === '/dashboards') {
    if (isAuthenticated) return 'authenticated user landing';
    return 'redirect from root';
  }
  
  if (isAuthenticated) return 'authenticated navigation';
  return 'protected route requires authentication';
}

/**
 * Redirect Flow Validator Component
 * Displays redirect history and loop warnings
 */
export const RedirectFlowValidator = () => {
  const { redirectHistory, loopDetected, clearHistory } = useRedirectLoopDetection();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;

  if (!isVisible && !loopDetected) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '8px 16px',
          backgroundColor: loopDetected ? '#dc3545' : '#0d6efd',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {loopDetected ? '⚠️ Loop Detected' : '🔍 Redirect Monitor'}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '500px',
        maxHeight: '400px',
        overflow: 'auto',
        backgroundColor: 'white',
        border: loopDetected ? '2px solid #dc3545' : '1px solid #dee2e6',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: loopDetected ? '#f8d7da' : '#f8f9fa'
        }}
      >
        <strong style={{ color: loopDetected ? '#721c24' : '#212529' }}>
          {loopDetected ? '⚠️ Redirect Loop Detected' : '🔍 Redirect Monitor'}
        </strong>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={clearHistory}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>
      
      <div style={{ padding: '12px' }}>
        {redirectHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
            No redirects logged yet
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
              Recent Navigation ({redirectHistory.length}):
            </div>
            {redirectHistory.slice().reverse().map((entry, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderLeft: `3px solid ${
                    entry.authState === 'authenticated' ? '#28a745' :
                    entry.authState === 'unauthenticated' ? '#ffc107' :
                    '#6c757d'
                  }`,
                  borderRadius: '3px'
                }}
              >
                <div style={{ color: '#495057', marginBottom: '4px' }}>
                  <strong>{new Date(entry.timestamp).toLocaleTimeString()}</strong>
                </div>
                <div style={{ color: '#0d6efd' }}>
                  {entry.from} → {entry.to}
                </div>
                <div style={{ color: '#6c757d', fontSize: '11px', marginTop: '4px' }}>
                  {entry.reason} ({entry.authState})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
