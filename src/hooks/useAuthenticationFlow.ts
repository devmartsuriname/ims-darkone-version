import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface AuthFlowState {
  showInitialSetup: boolean;
  isFirstTimeSetup: boolean;
  loading: boolean;
}

export const useAuthenticationFlow = () => {
  const [authFlow, setAuthFlow] = useState<AuthFlowState>({
    showInitialSetup: false,
    isFirstTimeSetup: false,
    loading: true
  });

  useEffect(() => {
    // Phase 4: Check for bypass flag
    const skipCheck = localStorage.getItem('skip_setup_check') === 'true';
    if (skipCheck) {
      console.warn('⚠️ Setup check bypassed by user');
      localStorage.removeItem('skip_setup_check'); // Clear flag after use
      setAuthFlow({
        showInitialSetup: false,
        isFirstTimeSetup: false,
        loading: false
      });
      return;
    }
    
    checkSystemSetup();
  }, []);

  const checkSystemSetup = async (retryCount = 0) => {
    try {
      setAuthFlow(prev => ({ ...prev, loading: true }));

      // Phase 1: Add timeout wrapper for RPC call
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('RPC timeout after 10 seconds')), 10000)
      );

      const rpcPromise = supabase.rpc('admin_user_exists');

      // Race between RPC and timeout
      const { data: hasAdminUsers, error } = await Promise.race([
        rpcPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Error in admin_user_exists RPC:', error);
        
        // Retry once if first attempt
        if (retryCount === 0) {
          console.log('Retrying RPC call in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return checkSystemSetup(1);
        }
        
        // Fail-safe: do NOT force setup to avoid lock-in
        setAuthFlow({
          showInitialSetup: false,
          isFirstTimeSetup: false,
          loading: false
        });
        return;
      }

      const adminExists = !!hasAdminUsers;
      const localSetupComplete = localStorage.getItem('ims_initial_setup_complete') === 'true';

      console.log('System setup check:', {
        adminExists,
        localSetupComplete
      });

      // Defensive: if admin exists, ensure flag is set
      if (adminExists && !localSetupComplete) {
        localStorage.setItem('ims_initial_setup_complete', 'true');
      }

      // Show initial setup only if no admin users exist and setup hasn't been completed locally
      if (!adminExists && !localSetupComplete) {
        setAuthFlow({
          showInitialSetup: true,
          isFirstTimeSetup: true,
          loading: false
        });
      } else {
        setAuthFlow({
          showInitialSetup: false,
          isFirstTimeSetup: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Unexpected error in system setup check:', error);
      setAuthFlow(prev => ({ ...prev, loading: false }));
    }
  };

  const completeInitialSetup = () => {
    localStorage.setItem('ims_initial_setup_complete', 'true');
    setAuthFlow({
      showInitialSetup: false,
      isFirstTimeSetup: false,
      loading: false
    });
    toast.success('Initial system setup completed successfully!');
  };

  const createInitialAdmin = async (adminData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    department?: string;
    position?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          email: adminData.email,
          password: adminData.password,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          phone: adminData.phone,
          department: adminData.department || 'Administration',
          position: adminData.position || 'System Administrator',
          role: 'admin'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to invoke user management function');
      }

      console.log('Admin creation response:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating initial admin:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create administrator account' 
      };
    }
  };

  return {
    ...authFlow,
    completeInitialSetup,
    createInitialAdmin,
    checkSystemSetup
  };
};