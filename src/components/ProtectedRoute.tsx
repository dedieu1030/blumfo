
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Current session:", currentSession?.user?.id);
      setSession(currentSession);
      setIsSignedIn(!!currentSession);
      setIsLoaded(true);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Affichage pendant le chargement
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-violet rounded-full border-t-transparent"></div>
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
