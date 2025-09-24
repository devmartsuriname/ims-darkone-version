import { DirectorGuard } from '@/components/auth/RoleGuards';
import DirectorReviewDashboard from './components/DirectorReviewDashboard';

const DirectorReviewPage = () => {
  return (
    <DirectorGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Director Review</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Reviews</a></li>
                  <li className="breadcrumb-item active">Director Review</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <DirectorReviewDashboard />
      </div>
    </DirectorGuard>
  );
};

export default DirectorReviewPage;