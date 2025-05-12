
import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useClerkSupabase() {
  const { userId, getToken, isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Effet pour gérer la connexion à Supabase avec le token JWT de Clerk
  useEffect(() => {
    // Ne rien faire si Clerk n'a pas encore chargé
    if (!isClerkLoaded) {
      return;
    }

    // Si utilisateur déconnecté de Clerk, déconnecter de Supabase aussi
    if (!isSignedIn || !userId) {
      supabase.auth.signOut();
      setLoading(false);
      return;
    }

    async function signInWithClerkToken() {
      try {
        setLoading(true);
        
        // Générer un token JWT personnalisé depuis Clerk
        const token = await getToken({ template: "supabase" });
        
        if (!token) {
          console.error("Failed to get token from Clerk");
          throw new Error("Authentication failed");
        }
        
        setSupabaseToken(token);
        
        // Utiliser le JWT pour s'authentifier sur Supabase
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'jwt',
          token,
        });
        
        if (error) {
          throw error;
        }
        
      } catch (err: any) {
        console.error("Error signing in with Clerk token:", err);
        toast.error("Erreur d'authentification avec Supabase");
      } finally {
        setLoading(false);
      }
    }

    signInWithClerkToken();

    // Configuration d'un intervalle pour rafraîchir le token
    const intervalId = setInterval(async () => {
      if (isSignedIn && userId) {
        const token = await getToken({ template: "supabase" });
        setSupabaseToken(token);
      }
    }, 10 * 60 * 1000); // Rafraîchir toutes les 10 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isClerkLoaded, isSignedIn, userId, getToken]);

  return {
    isAuthenticated: isSignedIn && !!supabaseToken && !loading,
    isLoading: loading || !isClerkLoaded,
    userId,
    userDetails: clerkUser,
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        // La déconnexion de Clerk sera gérée par le composant UserButton ou SignOutButton de Clerk
      } catch (error) {
        console.error("Error signing out from Supabase:", error);
      }
    }
  };
}
