import { AdminGuard } from '@/components/auth/RoleGuards';

const UserManagementPage = () => {
  return (
    <AdminGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">User Management</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Administration</a></li>
                  <li className="breadcrumb-item active">Users</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">System Users</h5>
                <p className="card-text">Manage system users, roles, and permissions.</p>
                <div className="alert alert-warning">
                  <strong>Admin Access Only:</strong> This section is restricted to administrators.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default UserManagementPage;