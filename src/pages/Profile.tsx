
import React from 'react';
import { Header } from '@/components/Header';
import { UserProfile } from '@/components/user/UserProfile';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Header
        title="Mon Profil"
        description="Consultez et gérez vos informations personnelles"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div>
        <UserProfile />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
