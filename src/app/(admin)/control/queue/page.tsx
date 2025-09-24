import { ControlGuard } from '@/components/auth/RoleGuards';

const ControlQueuePage = () => {
  return (
    <ControlGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Control Queue</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Control</a></li>
                  <li className="breadcrumb-item active">Queue</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Control Department Queue</h5>
                <p className="card-text">Applications pending control department review and assignment.</p>
                <div className="alert alert-info">
                  <strong>Note:</strong> This page will contain the control queue management interface.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ControlGuard>
  );
};

export default ControlQueuePage;