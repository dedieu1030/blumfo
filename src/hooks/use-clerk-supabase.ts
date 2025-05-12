
import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useClerkSupabase() {
  const { getToken, isLoaded, userId, isSignedIn } = useClerkAuth();
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setupSupabaseSession = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Obtenir un JWT personnalisé depuis Clerk, configuré pour Supabase
        // Note: Vous devez configurer un template JWT dans le dashboard Clerk
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.error('Impossible d\'obtenir un token JWT pour Supabase depuis Clerk');
          toast.error('Erreur d\'authentification avec la base de données');
          setLoading(false);
          return;
        }
        
        setSupabaseToken(token);
        
        // Configurer la session Supabase avec le token de Clerk
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token, // Utiliser le même token comme refresh token
        });
        
        if (error) {
          throw error;
        }
      } catch (err: any) {
        console.error('Erreur lors de la configuration de la session Supabase:', err);
        setError(err);
        toast.error('Erreur de connexion à la base de données');
      } finally {
        setLoading(false);
      }
    };
    
    setupSupabaseSession();
    
    // Actualiser le token périodiquement
    const intervalId = setInterval(setupSupabaseSession, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(intervalId);
  }, [isLoaded, isSignedIn, getToken]);

  return { 
    supabaseToken, 
    loading, 
    error,
    isAuthenticated: isSignedIn && supabaseToken !== null,
    userId
  };
}
