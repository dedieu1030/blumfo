
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Configurer l'écouteur d'authentification AVANT de vérifier la session existante
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        toast.info("Vous avez été déconnecté");
      } else if (event === 'SIGNED_IN') {
        toast.success("Connexion réussie");
      }
      
      setSession(currentSession);
      setIsSignedIn(!!currentSession);
      setIsLoaded(true);
      setError(null); // Réinitialiser les erreurs quand l'état d'authentification change
    });
    
    // Ensuite, vérifier s'il y a déjà une session existante
    const checkSession = async () => {
      try {
        console.log("Vérification de la session existante...");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur lors de la récupération de la session:", sessionError);
          setError("Impossible de vérifier votre session. Veuillez vous reconnecter.");
          setIsLoaded(true);
          return;
        }
        
        console.log("Session actuelle:", currentSession?.user?.id || "Aucune session");
        setSession(currentSession);
        setIsSignedIn(!!currentSession);
        setIsLoaded(true);
        
        // Vérifier si les tables nécessaires existent
        if (currentSession) {
          const tablesCheck = await Promise.all([
            checkTable('profiles'),
            checkTable('companies'),
            checkTable('clients')
          ]);
          
          const missingTables = ['profiles', 'companies', 'clients'].filter((_, index) => !tablesCheck[index]);
          
          if (missingTables.length > 0) {
            console.warn(`Tables manquantes: ${missingTables.join(', ')}`);
            // Ne pas bloquer l'utilisateur, juste l'avertir
            if (missingTables.includes('companies')) {
              toast.warning("La table des entreprises semble manquante. Certaines fonctionnalités pourraient être limitées.");
            }
            if (missingTables.includes('clients')) {
              toast.warning("La table des clients semble manquante. Certaines fonctionnalités pourraient être limitées.");
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        setError("Une erreur est survenue lors de la vérification de votre session.");
        setIsLoaded(true);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Fonction pour vérifier l'existence d'une table
  const checkTable = async (tableName: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .select('count(*)', { count: 'exact', head: true });
      
      return !error;
    } catch (err) {
      console.error(`Erreur lors de la vérification de la table ${tableName}:`, err);
      return false;
    }
  };
  
  // Affichage pendant le chargement
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Vérification de votre session...</p>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur d'authentification</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
