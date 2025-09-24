import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/RoleGuards';
import UserManagementTable from './components/UserManagementTable';
import UserModal from './components/UserModal';
import InitialSetupModal from './components/InitialSetupModal';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

const UserManagementPage = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    staffUsers: 0
  });

  // Check if initial setup is needed
  useEffect(() => {
    checkInitialSetup();
    fetchStats();
  }, [refreshKey]);

  useEffect(() => {
    // Auto-show initial setup if no admin exists
    const checkAdminExists = async () => {
      try {
        const { data: adminRoles, error } = await supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'admin')
          .eq('is_active', true)
          .limit(1);

        if (!error && (!adminRoles || adminRoles.length === 0)) {
          const setupComplete = localStorage.getItem('ims_initial_setup_complete');
          if (!setupComplete) {
            setShowInitialSetup(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin existence:', error);
      }
    };

    checkAdminExists();
  }, []);

  const checkInitialSetup = async () => {
    const setupComplete = localStorage.getItem('ims_initial_setup_complete');
    if (!setupComplete) {
      // Check if any admin users exist
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .eq('is_active', true)
        .limit(1);

      if (!error && (!data || data.length === 0)) {
        setShowInitialSetup(true);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          is_active,
          user_roles!profiles_user_roles_user_id_fkey (
            role,
            is_active
          )
        `);

      if (profiles) {
        const totalUsers = profiles.length;
        const activeUsers = profiles.filter(p => p.is_active).length;
        const adminUsers = profiles.filter(p => 
          Array.isArray(p.user_roles) && p.user_roles.some((r: any) => r.role === 'admin' && r.is_active)
        ).length;
        const staffUsers = profiles.filter(p => 
          Array.isArray(p.user_roles) && p.user_roles.some((r: any) => ['staff', 'front_office'].includes(r.role) && r.is_active)
        ).length;

        setStats({ totalUsers, activeUsers, adminUsers, staffUsers });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUserId(undefined);
    setShowUserModal(true);
  };

  const handleModalSuccess = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Operation completed successfully');
  };

  const handleModalClose = () => {
    setShowUserModal(false);
    setSelectedUserId(undefined);
  };

  const handleInitialSetupComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AdminGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">User Management</h4>
              <div className="page-title-right">
                <div className="d-flex gap-2 align-items-center">
                  <EnhancedButton
                    variant="success"
                    onClick={handleCreateUser}
                  >
                    <i className="bi bi-person-plus"></i> Add User
                  </EnhancedButton>
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item"><a href="/admin">IMS</a></li>
                    <li className="breadcrumb-item"><a href="/admin">Administration</a></li>
                    <li className="breadcrumb-item active">Users</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.totalUsers}</h4>
                    <span className="small">Total Users</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-people" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.activeUsers}</h4>
                    <span className="small">Active Users</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-person-check" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.adminUsers}</h4>
                    <span className="small">Administrators</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-shield-check" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.staffUsers}</h4>
                    <span className="small">Staff Members</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-person-workspace" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UserManagementTable
          onUserSelect={handleUserSelect}
          refreshKey={refreshKey}
        />

        {/* User Modal */}
        <UserModal
          userId={selectedUserId}
          isOpen={showUserModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />

        {/* Initial Setup Modal */}
        <InitialSetupModal
          isOpen={showInitialSetup}
          onClose={() => setShowInitialSetup(false)}
          onSuccess={handleInitialSetupComplete}
        />
      </div>
    </AdminGuard>
  );
};

export default UserManagementPage;