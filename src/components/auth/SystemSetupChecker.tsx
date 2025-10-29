import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticationFlow } from '@/hooks/useAuthenticationFlow';
import { useAuthContext } from '@/context/useAuthContext';

interface SystemSetupCheckerProps {
  children: React.ReactNode;
}

const SystemSetupChecker: React.FC<SystemSetupCheckerProps> = ({ children }) => {
  const { showInitialSetup, isFirstTimeSetup, loading } = useAuthenticationFlow();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [maxWaitExceeded, setMaxWaitExceeded] = useState(false);

  // Phase 2: Add maximum wait timeout
  useEffect(() => {
    if (loading || authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout exceeded (15s), enabling recovery mode');
        setMaxWaitExceeded(true);
      }, 15000);
      
      return () => clearTimeout(timeout);
    } else {
      setMaxWaitExceeded(false);
    }
  }, [loading, authLoading]);

  useEffect(() => {
    console.log('SystemSetupChecker state:', {
      setupLoading: loading,
      authLoading: authLoading,
      showInitialSetup,
      isFirstTimeSetup,
      isAuthenticated,
      pathname: location.pathname,
      maxWaitExceeded
    });

    if (loading || authLoading) return;

    // If system needs initial setup and not on setup page, redirect to setup
    if (showInitialSetup && isFirstTimeSetup && location.pathname !== '/setup') {
      console.log('Redirecting to setup page - no admin users exist');
      navigate('/setup', { replace: true });
      return;
    }

    // If admin exists or setup is complete, block /setup and redirect to sign-in
    if ((!showInitialSetup || !isFirstTimeSetup) && location.pathname === '/setup') {
      console.log('Setup disabled - redirecting to sign-in');
      navigate('/auth/sign-in', { replace: true });
    }
  }, [showInitialSetup, isFirstTimeSetup, isAuthenticated, loading, authLoading, navigate, location.pathname]);

  // Phase 3: Show recovery mode if timeout exceeded
  if ((loading || authLoading) && maxWaitExceeded) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-warning fw-bold">Loading is taking longer than expected...</p>
          <button 
            className="btn btn-outline-primary mt-3"
            onClick={() => {
              console.log('User initiated recovery mode');
              localStorage.setItem('skip_setup_check', 'true');
              window.location.reload();
            }}
          >
            Skip Setup Check & Continue
          </button>
          <p className="mt-3 small text-muted">
            <strong>Diagnostic Info:</strong><br />
            Setup Loading: {loading ? 'true' : 'false'}<br />
            Auth Loading: {authLoading ? 'true' : 'false'}<br />
            Path: {location.pathname}
          </p>
        </div>
      </div>
    );
  }

  // Show loading while checking system state or authentication
  if (loading || authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">
            {loading ? 'Checking system setup...' : 'Loading authentication...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SystemSetupChecker;