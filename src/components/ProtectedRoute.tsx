
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, checkSupabaseConnection, checkAuthConnection } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{title: string, message: string}>({
    title: "Problème de connexion",
    message: "Un problème est survenu lors de la connexion au service d'authentification. Veuillez vérifier que vous êtes bien connecté à Internet et que le service est disponible."
  });
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    // Limite le nombre de tentatives de chargement pour éviter les boucles infinies
    if (loadAttempts > 3) {
      console.error("Trop de tentatives de chargement, possible boucle infinie");
      setIsLoaded(true);
      setShowConnectionError(true);
      setErrorDetails({
        title: "Trop de tentatives",
        message: "Impossible de se connecter après plusieurs tentatives. Veuillez réessayer plus tard."
      });
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.log(`Vérification de l'authentification (tentative ${loadAttempts + 1})`);
        setIsChecking(true);
        
        // Vérifier la connexion à Supabase
        const connectionStatus = await checkSupabaseConnection();
        if (!connectionStatus.success) {
          console.error("Problème de connexion à Supabase:", connectionStatus.message);
          setShowConnectionError(true);
          setErrorDetails({
            title: "Problème de connexion",
            message: connectionStatus.message || "Impossible de se connecter à la base de données."
          });
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
          setErrorDetails({
            title: "Problème persistant",
            message: "Un problème est survenu lors de la connexion. Veuillez vérifier votre connexion internet ou contacter le support."
          });
        }
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [loadAttempts]);
  
  // Fonction pour vérifier manuellement la connexion
  const verifyConnection = async () => {
    setIsChecking(true);
    try {
      // Vérifier la connexion à Supabase
      const connectionStatus = await checkSupabaseConnection();
      
      // Vérifier l'état de l'authentification
      const authStatus = await checkAuthConnection();
      
      if (connectionStatus.success && authStatus.success) {
        toast.success("La connexion à la base de données est fonctionnelle");
        setShowConnectionError(false);
        
        // Si l'utilisateur est authentifié, mettre à jour l'état
        if (authStatus.isAuthenticated) {
          setSession(authStatus.session);
          setIsSignedIn(true);
        }
      } else {
        const errorMessage = connectionStatus.success 
          ? "Problème d'authentification: " + (authStatus.message || "erreur inconnue") 
          : "Problème de connexion: " + (connectionStatus.message || "erreur inconnue");
        
        toast.error(errorMessage);
        setErrorDetails({
          title: connectionStatus.success ? "Problème d'authentification" : "Problème de connexion",
          message: errorMessage
        });
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la connexion:", err);
      toast.error("Erreur lors de la vérification de la connexion");
    } finally {
      setIsChecking(false);
    }
  };
  
  // Affichage pour le problème de connexion
  if (showConnectionError) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDetails.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">{errorDetails.message}</p>
              <p>Cela peut être dû à un problème de connexion à Internet ou à la base de données.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
            <AlertDialogAction 
              onClick={verifyConnection} 
              disabled={isChecking}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>Vérifier la connexion</>
              )}
            </AlertDialogAction>
            <AlertDialogAction onClick={() => window.location.reload()} className="w-full sm:w-auto">
              Rafraîchir la page
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
