import { DirectorGuard } from '@/components/auth/RoleGuards';

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

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">DVH Director Review</h5>
                <p className="card-text">Applications awaiting director review and recommendation.</p>
                <div className="alert alert-warning">
                  <strong>Director Access Only:</strong> This section is restricted to DVH Directors.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DirectorGuard>
  );
};

export default DirectorReviewPage;