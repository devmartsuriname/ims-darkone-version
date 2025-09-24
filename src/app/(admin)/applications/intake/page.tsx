import { StaffGuard } from '@/components/auth/RoleGuards';

const ApplicationIntakePage = () => {
  return (
    <StaffGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">New Application</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Applications</a></li>
                  <li className="breadcrumb-item active">New Application</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Housing Subsidy Application</h5>
                <p className="card-text">Create a new housing subsidy application for a citizen.</p>
                <div className="alert alert-info">
                  <strong>Note:</strong> This page will contain the application intake form.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffGuard>
  );
};

export default ApplicationIntakePage;