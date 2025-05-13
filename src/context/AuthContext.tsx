
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  userProfile: Partial<UserProfile>;
  error: string;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  
  const { 
    userProfile,
    loading: profileLoading, 
    error: profileError,
    updateUserProfile,
  } = useUserProfile();
  
  useEffect(() => {
    const { data: authStateChangeListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthError(error.message);
          console.error("Error getting auth session:", error.message);
        }
        
        if (data.session) {
          setUser(data.session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
        setAuthError(error instanceof Error ? error.message : String(error));
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (authStateChangeListener && authStateChangeListener.subscription) {
        authStateChangeListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      setAuthError(error.message);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  // Combinaison du chargement et des erreurs de l'authentification et du profil
  const loading = authLoading || profileLoading;
  const error = authError || profileError;

  const value = {
    isAuthenticated,
    loading,
    user,
    userProfile,
    error,
    updateUserProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
