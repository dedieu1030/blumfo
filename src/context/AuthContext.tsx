
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  error: Error | null;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const syncSupabaseAuth = async () => {
    try {
      if (!user) return;
      
      // Récupération du JWT Clerk
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        console.error("Impossible de récupérer le token Clerk");
        return;
      }
      
      // Connecter à Supabase avec le token JWT de Clerk
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.primaryEmailAddress?.emailAddress || '',
        password: token.substring(0, 32) // Créer un mot de passe basé sur le token
      });
      
      if (signInError) {
        // Si l'utilisateur n'existe pas dans Supabase, créons-le
        const { error: signUpError } = await supabase.auth.signUp({
          email: user.primaryEmailAddress?.emailAddress || '',
          password: token.substring(0, 32),
          options: {
            data: {
              full_name: user.fullName || '',
              avatar_url: user.imageUrl || '',
            },
          },
        });
        
        if (signUpError) {
          console.error("Erreur lors de la synchronisation avec Supabase:", signUpError);
          throw new Error("Erreur de synchronisation avec Supabase");
        }
      }
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
      setError(error as Error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si l'utilisateur est connecté à Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUserProfile(null);
        return;
      }
      
      // Récupérer le profil de l'utilisateur
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      
      setUserProfile(data as UserProfile);
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    if (!isClerkLoaded) return;

    const initAuth = async () => {
      try {
        if (isSignedIn && user) {
          await syncSupabaseAuth();
          await fetchUserProfile();
        } else {
          // Si déconnecté de Clerk, déconnectons aussi de Supabase
          if (isClerkLoaded) {
            await supabase.auth.signOut();
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error("Erreur d'initialisation de l'auth:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Mettre en place l'écoute des changements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session && isSignedIn) {
          // Réessayer la synchronisation si la session Supabase expire mais que Clerk est connecté
          syncSupabaseAuth();
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [isClerkLoaded, isSignedIn, user]);

  const contextValue = {
    isAuthenticated: isSignedIn || false,
    isLoading,
    userProfile,
    error,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
