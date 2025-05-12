
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    console.log("Utilisateur non authentifié, redirection vers /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Rendre les enfants (le contenu protégé) si authentifié
  console.log("Utilisateur authentifié, affichage du contenu protégé");
  return <>{children}</>;
}
