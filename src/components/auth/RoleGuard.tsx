import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';
import Spinner from '@/components/Spinner';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string[];
  fallbackPath?: string;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRoles, 
  requireAll = false 
}) => {
  const { user, loading, roles } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-warning">
              <div className="card-body text-center">
                <h5 className="card-title text-warning">Access Pending</h5>
                <p className="card-text">
                  Your account is being processed. Please contact the administrator for role assignment.
                </p>
                <Navigate to="/dashboards" replace />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get user's active roles
  const userRoles = roles.filter(r => r.is_active).map(r => r.role);
  
  // Admin and IT always have access
  if (userRoles.includes('admin') || userRoles.includes('it')) {
    return <>{children}</>;
  }

  // Check if user has required roles
  const hasRequiredRole = requireAll 
    ? requiredRoles.every(role => userRoles.includes(role as any))
    : requiredRoles.some(role => userRoles.includes(role as any));

  if (!hasRequiredRole) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-body text-center">
                <h5 className="card-title text-danger">Access Denied</h5>
                <p className="card-text">
                  You don't have permission to access this page. Required role(s): {requiredRoles.join(', ')}
                </p>
                <p className="text-muted">Your current role(s): {userRoles.join(', ')}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;