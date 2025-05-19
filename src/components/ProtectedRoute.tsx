
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // Configurer l'écouteur d'authentification AVANT de vérifier la session existante
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      setSession(currentSession);
      setIsSignedIn(!!currentSession);
      setIsLoaded(true);
    });
    
    // Ensuite, vérifier s'il y a déjà une session existante
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Current session:", currentSession?.user?.id);
        setSession(currentSession);
        setIsSignedIn(!!currentSession);
        setIsLoaded(true);
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        setIsLoaded(true);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Affichage pendant le chargement
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
