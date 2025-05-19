
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
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Configurer l'écouteur d'authentification AVANT de vérifier la session existante
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsSignedIn(false);
      } else if (currentSession) {
        setSession(currentSession);
        setIsSignedIn(true);
      }
      
      setIsLoaded(true);
    });
    
    // Vérifier s'il y a déjà une session existante
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          setError(error);
          setIsLoaded(true);
          return;
        }
        
        console.log("Session actuelle:", data?.session?.user?.id || "aucune session");
        
        if (data.session) {
          setSession(data.session);
          setIsSignedIn(true);
        } else {
          // Tentative de rafraîchissement du token si possible
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.log("Impossible de rafraîchir la session:", refreshError);
          } else if (refreshData.session) {
            console.log("Session rafraîchie avec succès");
            setSession(refreshData.session);
            setIsSignedIn(true);
          }
        }
      } catch (err) {
        console.error("Exception lors de la vérification de la session:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
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
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-6 max-w-md bg-destructive/10 rounded-lg border border-destructive/30">
          <h2 className="text-lg font-semibold text-destructive mb-2">Erreur d'authentification</h2>
          <p className="text-sm text-muted-foreground mb-4">{error.message || "Une erreur est survenue lors de la vérification de votre session."}</p>
          <button 
            className="px-4 py-2 bg-background border rounded-md hover:bg-accent"
            onClick={() => window.location.reload()}
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }
  
  // Redirection si non authentifié
  if (!isSignedIn) {
    console.log("Utilisateur non connecté, redirection vers /auth");
    return <Navigate to="/auth" replace />;
  }
  
  // Rendu des enfants si authentifié
  return <>{children}</>;
}
