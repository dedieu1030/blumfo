
import React from 'react';
import { Header } from '@/components/Header';
import { UserProfile } from '@/components/user/UserProfile';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading, user, error } = useAuth();
  const [showError, setShowError] = useState<boolean>(false);
  const [initAttempt, setInitAttempt] = useState(0);
  
  // Vérifier les erreurs après le chargement et montrer la boîte de dialogue si nécessaire
  useEffect(() => {
    if (!loading && error) {
      setShowError(true);
      toast.error("Un problème est survenu lors du chargement de votre profil");
    }
  }, [loading, error]);
  
  // Gérer les tentatives d'initialisation pour éviter les boucles infinies
  useEffect(() => {
    if (initAttempt > 3) {
      console.error("Trop de tentatives d'initialisation du profil");
      return;
    }
    
    // Cette logique ne s'exécute que pendant le premier rendu
    if (initAttempt === 0) {
      setInitAttempt(prev => prev + 1);
    }
  }, [initAttempt]);

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

      {/* Afficher une alerte si une erreur se produit avec le profil */}
      {error && showError && (
        <AlertDialog open={showError} onOpenChange={setShowError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Problème avec le profil</AlertDialogTitle>
              <AlertDialogDescription>
                Un problème est survenu lors du chargement de votre profil. 
                Veuillez rafraîchir la page ou contacter le support si le problème persiste.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => window.location.reload()}>
                Rafraîchir la page
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
