import React, { useEffect } from 'react';
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

  useEffect(() => {
    console.log('SystemSetupChecker state:', {
      setupLoading: loading,
      authLoading: authLoading,
      showInitialSetup,
      isFirstTimeSetup,
      isAuthenticated,
      pathname: location.pathname
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