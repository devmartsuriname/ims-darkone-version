import { StaffGuard } from '@/components/auth/RoleGuards';

const ApplicationListPage = () => {
  return (
    <StaffGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">All Applications</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Applications</a></li>
                  <li className="breadcrumb-item active">All Applications</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Application Management</h5>
                <p className="card-text">View and manage all housing subsidy applications.</p>
                <div className="alert alert-info">
                  <strong>Note:</strong> This page will contain the applications list and management interface.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffGuard>
  );
};

export default ApplicationListPage;