import { ControlGuard } from '@/components/auth/RoleGuards';
import { ControlQueueTable } from './components/ControlQueueTable';

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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="card-title mb-1">Control Department Queue</h5>
                    <p className="card-text mb-0">Applications pending control department review and assignment</p>
                  </div>
                  <div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/control/visits'}
                    >
                      <i className="bx bx-calendar me-2"></i>
                      My Visits
                    </button>
                  </div>
                </div>
                
                <ControlQueueTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ControlGuard>
  );
};

export default ControlQueuePage;