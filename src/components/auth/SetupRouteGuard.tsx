import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticationFlow } from '@/hooks/useAuthenticationFlow';
import Preloader from '@/components/Preloader';

interface SetupRouteGuardProps {
  children: React.ReactNode;
}

const SetupRouteGuard: React.FC<SetupRouteGuardProps> = ({ children }) => {
  const { loading, showInitialSetup, isFirstTimeSetup } = useAuthenticationFlow();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!(showInitialSetup && isFirstTimeSetup)) {
        // Setup not needed => disable /setup
        console.log('Setup not needed, redirecting to sign-in');
        navigate('/auth/sign-in', { replace: true });
      }
    }
  }, [loading, showInitialSetup, isFirstTimeSetup, navigate]);

  if (loading) return <Preloader />;

  if (!(showInitialSetup && isFirstTimeSetup)) return null;

  return <>{children}</>;
};

export default SetupRouteGuard;