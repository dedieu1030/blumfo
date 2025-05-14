
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  useEffect(() => {
    // Limite le nombre de tentatives de chargement pour éviter les boucles infinies
    if (loadAttempts > 3) {
      console.error("Trop de tentatives de chargement, possible boucle infinie");
      setIsLoaded(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        // Configurer l'écouteur d'authentification AVANT de vérifier la session existante
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log("Auth state changed:", event, currentSession?.user?.id);
          setSession(currentSession);
          setIsSignedIn(!!currentSession);
          setIsLoaded(true);
        });
        
        // Ensuite, vérifier s'il y a déjà une session existante
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Current session:", currentSession?.user?.id);
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
      }
    };
    
    checkAuth();
  }, [loadAttempts]);
  
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
