import React from 'react';
import RoleGuard from './RoleGuard';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['admin', 'it']}>
    {children}
  </RoleGuard>
);

interface StaffGuardProps {
  children: React.ReactNode;
}

export const StaffGuard: React.FC<StaffGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['admin', 'it', 'staff', 'front_office']}>
    {children}
  </RoleGuard>
);

interface ControlGuardProps {
  children: React.ReactNode;
}

export const ControlGuard: React.FC<ControlGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['admin', 'it', 'control']}>
    {children}
  </RoleGuard>
);

interface ReviewerGuardProps {
  children: React.ReactNode;
}

export const ReviewerGuard: React.FC<ReviewerGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['admin', 'it', 'staff', 'control', 'director', 'minister']}>
    {children}
  </RoleGuard>
);

interface DirectorGuardProps {
  children: React.ReactNode;
}

export const DirectorGuard: React.FC<DirectorGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['admin', 'it', 'director']}>
    {children}
  </RoleGuard>
);

interface MinisterGuardProps {
  children: React.ReactNode;
}

export const MinisterGuard: React.FC<MinisterGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['admin', 'it', 'minister']}>
    {children}
  </RoleGuard>
);

interface ApplicantGuardProps {
  children: React.ReactNode;
}

export const ApplicantGuard: React.FC<ApplicantGuardProps> = ({ children }) => (
  <RoleGuard requiredRoles={['applicant']}>
    {children}
  </RoleGuard>
);