
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { UserProfile } from '@/components/user/UserProfile';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase, tableExists } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingTables, setIsCheckingTables] = useState(true);
  const [tablesExist, setTablesExist] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // Vérifier l'existence des tables nécessaires
    async function checkTables() {
      try {
        if (!user) return;
        
        const profilesExist = await tableExists('profiles');
        const companiesExist = await tableExists('companies');
        
        console.log("Tables check:", { profilesExist, companiesExist });
        
        if (!profilesExist) {
          toast.warning("La table des profils semble manquante. Certaines fonctionnalités pourraient être limitées.");
        }
        
        if (!companiesExist) {
          toast.warning("La table des entreprises semble manquante. Certaines fonctionnalités pourraient être limitées.");
        }
        
        setTablesExist(profilesExist);
      } catch (error) {
        console.error("Erreur lors de la vérification des tables:", error);
      } finally {
        setIsCheckingTables(false);
      }
    }
    
    if (isAuthenticated && !loading && user) {
      checkTables();
    } else {
      setIsCheckingTables(false);
    }
  }, [isAuthenticated, loading, user]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading || (isAuthenticated && isCheckingTables)) {
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
