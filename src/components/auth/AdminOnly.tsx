
import React from 'react';
import { RoleGuard } from './RoleGuard';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders children for admin users
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback }) => {
  return (
    <RoleGuard role="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

export default AdminOnly;
