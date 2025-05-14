
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [showConnectionError, setShowConnectionError] = useState(false);
  
  useEffect(() => {
    // Limite le nombre de tentatives de chargement pour éviter les boucles infinies
    if (loadAttempts > 3) {
      console.error("Trop de tentatives de chargement, possible boucle infinie");
      setIsLoaded(true);
      setShowConnectionError(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.log(`Vérification de l'authentification (tentative ${loadAttempts + 1})`);
        
        // Vérifier la connexion à Supabase
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error("Problème de connexion à Supabase");
          setShowConnectionError(true);
          setIsLoaded(true);
          return;
        }
        
        // Configurer l'écouteur d'authentification AVANT de vérifier la session existante
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log("Auth state changed:", event, currentSession?.user?.id);
          setSession(currentSession);
          setIsSignedIn(!!currentSession);
          setIsLoaded(true);
        });
        
        // Ensuite, vérifier s'il y a déjà une session existante
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Session actuelle:", currentSession?.user?.id || "Aucune session");
        setSession(currentSession);
        setIsSignedIn(!!currentSession);
        setIsLoaded(true);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsLoaded(true);
        setLoadAttempts(prev => prev + 1);
        toast.error("Erreur de connexion au service d'authentification");
        
        // Si l'erreur persiste après plusieurs tentatives
        if (loadAttempts >= 2) {
          setShowConnectionError(true);
        }
      }
    };
    
    checkAuth();
  }, [loadAttempts]);
  
  // Affichage pour le problème de connexion
  if (showConnectionError) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Problème de connexion</AlertDialogTitle>
            <AlertDialogDescription>
              Un problème est survenu lors de la connexion au service d'authentification.
              Veuillez vérifier que vous êtes bien connecté à Internet et que le service est disponible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => window.location.reload()}>
              Réessayer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  // Affichage pendant le chargement
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-violet rounded-full border-t-transparent mb-4"></div>
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    );
  }
  
  // Redirection si non authentifié
  if (!isSignedIn) {
    console.log("User not signed in, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }
  
  // Rendu des enfants si authentifié
  return <>{children}</>;
}
