import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';
import { Card, CardBody, Alert } from 'react-bootstrap';

interface RouteGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  requireAll?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  allowedRoles, 
  children, 
  requireAll = false 
}) => {
  const { roles, isAuthenticated } = useAuthContext();

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // If no roles loaded yet, show loading
  if (!roles) {
    return (
      <Card>
        <CardBody>
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Get user's active roles
  const userRoles = roles.filter(r => r.is_active).map(r => r.role);

  // Admin and IT roles always have access
  if (userRoles.includes('admin') || userRoles.includes('it')) {
    return <>{children}</>;
  }

  // Check if user has required roles
  const hasRequiredRole = requireAll
    ? allowedRoles.every(role => userRoles.includes(role as any))
    : allowedRoles.some(role => userRoles.includes(role as any));

  if (!hasRequiredRole) {
    return (
      <Card>
        <CardBody>
          <Alert variant="warning">
            <h5>Access Denied</h5>
            <p>You do not have permission to access this page.</p>
            <p>Required roles: {allowedRoles.join(', ')}</p>
            <p>Your roles: {userRoles.join(', ') || 'None'}</p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;