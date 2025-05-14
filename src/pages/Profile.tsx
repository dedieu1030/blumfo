
import React from 'react';
import { Header } from '@/components/Header';
import { UserProfile } from '@/components/user/UserProfile';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2, RefreshCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading, user, error } = useAuth();
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [initAttempt, setInitAttempt] = useState(0);
  const [connectionChecking, setConnectionChecking] = useState(false);
  
  // Vérifier les erreurs après le chargement et montrer la boîte de dialogue si nécessaire
  useEffect(() => {
    if (!loading && error) {
      console.error("Erreur de chargement du profil:", error);
      setShowError(true);
      setErrorMessage(error.message || "Un problème est survenu lors du chargement de votre profil");
      toast.error("Un problème est survenu lors du chargement de votre profil");
    }
  }, [loading, error]);
  
  // Gérer les tentatives d'initialisation pour éviter les boucles infinies
  useEffect(() => {
    if (initAttempt > 3) {
      console.error("Trop de tentatives d'initialisation du profil");
      setShowError(true);
      setErrorMessage("Impossible d'initialiser le profil après plusieurs tentatives");
      return;
    }
    
    // Cette logique ne s'exécute que pendant le premier rendu
    if (initAttempt === 0) {
      setInitAttempt(prev => prev + 1);
    }
  }, [initAttempt]);

  // Fonction pour vérifier la connexion à Supabase
  const verifyConnection = async () => {
    setConnectionChecking(true);
    try {
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        toast.success("La connexion à la base de données est fonctionnelle");
        setShowError(false);
      } else {
        toast.error("La connexion à la base de données est impossible");
        setErrorMessage("Impossible de se connecter à la base de données");
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la connexion:", err);
      toast.error("Erreur lors de la vérification de la connexion");
    } finally {
      setConnectionChecking(false);
    }
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Vérification de votre profil...</p>
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
      {showError && (
        <AlertDialog open={showError} onOpenChange={setShowError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Problème avec le profil</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>{errorMessage}</p>
                <p>Cela peut être dû à un problème de connexion à la base de données ou à la table de profils manquante.</p>
                <div className="flex items-center justify-center mt-4">
                  <Button 
                    onClick={verifyConnection} 
                    disabled={connectionChecking}
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    {connectionChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                    Vérifier la connexion
                  </Button>
                </div>
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
