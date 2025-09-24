import React from 'react';
import { useAuthContext } from '@/context/useAuthContext';

interface RoleCheckProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

const RoleCheck: React.FC<RoleCheckProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { roles } = useAuthContext();

  if (!roles || roles.length === 0) {
    return <>{fallback}</>;
  }

  // Get user's active roles
  const userRoles = roles.filter(r => r.is_active).map(r => r.role);

  // Admin and IT roles always have access
  if (userRoles.includes('admin') || userRoles.includes('it')) {
    return <>{children}</>;
  }

  const hasRequiredRole = requireAll
    ? allowedRoles.every(role => userRoles.includes(role as any))
    : allowedRoles.some(role => userRoles.includes(role as any));

  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
};

export default RoleCheck;