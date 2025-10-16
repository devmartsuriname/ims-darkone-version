import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/RoleGuards';
import UserManagementTable from './components/UserManagementTable';
import UserModal from './components/UserModal';
import InitialSetupModal from './components/InitialSetupModal';
import { UATUserSeeder } from './components/UATUserSeeder';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';

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
      // Use separate count queries to avoid the RLS embed issue
      const [
        { count: totalUsers }, 
        { count: activeUsers }, 
        { count: adminUsers }, 
        { count: staffUsers }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin').eq('is_active', true),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).in('role', ['staff', 'front_office']).eq('is_active', true),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        adminUsers: adminUsers || 0,
        staffUsers: staffUsers || 0,
      });
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AdminGuard>
      <div className="container-fluid">
        <PageTitle title="User Management" subName="Administration" />
        
        {/* UAT User Seeding */}
        <UATUserSeeder onSuccess={handleRefresh} />
        
        <div className="row mb-3">
          <div className="col-12 text-end">
            <EnhancedButton
              variant="success"
              onClick={handleCreateUser}
            >
              <i className="bi bi-person-plus"></i> Add User
            </EnhancedButton>
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