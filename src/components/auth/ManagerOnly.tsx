
import React from 'react';
import { RoleGuard } from './RoleGuard';

interface ManagerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children for manager and admin users
 */
export const ManagerOnly: React.FC<ManagerOnlyProps> = ({ children, fallback }) => {
  return (
    <RoleGuard role={["manager", "admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

export default ManagerOnly;
