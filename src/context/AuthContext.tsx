
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

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
      
      console.log("Tentative de synchronisation avec Supabase...");
      
      // Récupérer le JWT de Clerk pour Supabase
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        console.error("Impossible de récupérer le token Clerk");
        return;
      }
      
      // Utiliser le JWT pour s'authentifier avec Supabase
      const { data, error: signInError } = await supabase.auth.signInWithJwt({
        jwt: token,
      });
      
      if (signInError) {
        console.error("Erreur lors de la connexion à Supabase avec JWT:", signInError);
        return;
      }
      
      console.log("Authentification Supabase réussie avec JWT:", data);
      
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
      setError(error as Error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // Vérifier si l'utilisateur est connecté à Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Pas de session Supabase active");
        setUserProfile(null);
        return;
      }
      
      console.log("Session Supabase active, récupération du profil...");
      
      // Récupérer le profil de l'utilisateur
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return;
      }
      
      console.log("Profil récupéré:", data);
      setUserProfile(data as UserProfile);
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err);
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    if (!isClerkLoaded) return;

    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        if (isSignedIn && user) {
          console.log("Utilisateur connecté dans Clerk:", user.id);
          await syncSupabaseAuth();
          await fetchUserProfile();
        } else {
          // Si déconnecté de Clerk, déconnectons aussi de Supabase
          if (isClerkLoaded) {
            await supabase.auth.signOut();
            setUserProfile(null);
            console.log("Utilisateur non connecté dans Clerk, déconnexion de Supabase");
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
  }, [isClerkLoaded, isSignedIn, user]);

  const contextValue = {
    // Considère l'utilisateur comme authentifié s'il est connecté à Clerk,
    // même si la synchronisation avec Supabase n'est pas encore terminée
    isAuthenticated: !!isSignedIn,
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
