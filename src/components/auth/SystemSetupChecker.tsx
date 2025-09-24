import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticationFlow } from '@/hooks/useAuthenticationFlow';
import { useAuthContext } from '@/context/useAuthContext';

interface SystemSetupCheckerProps {
  children: React.ReactNode;
}

const SystemSetupChecker: React.FC<SystemSetupCheckerProps> = ({ children }) => {
  const { showInitialSetup, isFirstTimeSetup, loading } = useAuthenticationFlow();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if already on setup page or loading
    if (loading || location.pathname === '/setup') return;

    // If system needs initial setup and user is not authenticated, redirect to setup
    if (showInitialSetup && isFirstTimeSetup && !isAuthenticated) {
      navigate('/setup', { replace: true });
    }
  }, [showInitialSetup, isFirstTimeSetup, isAuthenticated, loading, navigate, location.pathname]);

  // Show loading while checking system state
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Checking system setup...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SystemSetupChecker;