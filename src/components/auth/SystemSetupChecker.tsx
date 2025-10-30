import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticationFlow } from '@/hooks/useAuthenticationFlow';
import { useAuthContext } from '@/context/useAuthContext';
import { log } from '@/utils/log';
import Preloader from '@/components/Preloader';

interface SystemSetupCheckerProps {
  children: React.ReactNode;
}

const SystemSetupChecker: React.FC<SystemSetupCheckerProps> = ({ children }) => {
  const { showInitialSetup, isFirstTimeSetup, loading } = useAuthenticationFlow();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    log.setup.debug('SystemSetupChecker state:', {
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
      log.setup.info('Redirecting to setup page - no admin users exist');
      navigate('/setup', { replace: true });
      return;
    }

    // If admin exists or setup is complete, block /setup and redirect to sign-in
    if ((!showInitialSetup || !isFirstTimeSetup) && location.pathname === '/setup') {
      log.setup.info('Setup disabled - redirecting to sign-in');
      navigate('/auth/sign-in', { replace: true });
    }
  }, [showInitialSetup, isFirstTimeSetup, isAuthenticated, loading, authLoading, navigate, location.pathname]);

  // Show loading while checking system state or authentication
  if (loading || authLoading) {
    return <Preloader />;
  }

  return <>{children}</>;
};

export default SystemSetupChecker;