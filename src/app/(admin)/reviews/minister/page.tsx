import { MinisterGuard } from '@/components/auth/RoleGuards';
import MinisterDecisionDashboard from './components/MinisterDecisionDashboard';

const MinisterDecisionPage = () => {
  return (
    <MinisterGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Minister Decision</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Reviews</a></li>
                  <li className="breadcrumb-item active">Minister Decision</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <MinisterDecisionDashboard />
      </div>
    </MinisterGuard>
  );
};

export default MinisterDecisionPage;