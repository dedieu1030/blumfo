
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppRole } from '@/types/auth';

interface RoleGuardProps {
  /**
   * Children to render if user has required role
   */
  children: React.ReactNode;
  /**
   * Role required to view the children
   */
  role: AppRole | AppRole[];
  /**
   * Optional fallback component to show if user doesn't have required role
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user's role
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  role, 
  fallback = null 
}) => {
  const { hasRole, isLoading } = useAuth();
  
  // Don't show anything while loading auth state
  if (isLoading) {
    return null;
  }
  
  // Check for multiple roles (any match)
  if (Array.isArray(role)) {
    const hasAnyRole = role.some(r => hasRole(r));
    return hasAnyRole ? <>{children}</> : <>{fallback}</>;
  }
  
  // Check for single role
  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
