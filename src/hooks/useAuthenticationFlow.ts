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
    checkSystemSetup();
  }, []);

  const checkSystemSetup = async () => {
    try {
      setAuthFlow(prev => ({ ...prev, loading: true }));

      // Check if any admin users exist in the system
      const { data: adminUsers, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, is_active')
        .eq('role', 'admin')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Error checking admin users:', error);
        // If there's an error querying, assume setup is needed to be safe
        setAuthFlow({
          showInitialSetup: true,
          isFirstTimeSetup: true,
          loading: false
        });
        return;
      }

      const hasAdminUsers = adminUsers && adminUsers.length > 0;
      const localSetupComplete = localStorage.getItem('ims_initial_setup_complete') === 'true';

      console.log('System setup check:', {
        hasAdminUsers,
        localSetupComplete,
        adminCount: adminUsers?.length || 0
      });

      // Show initial setup if no admin users exist and setup hasn't been completed locally
      if (!hasAdminUsers && !localSetupComplete) {
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
      console.error('Error in system setup check:', error);
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