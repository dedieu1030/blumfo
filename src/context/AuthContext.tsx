
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRoles } from "@/services/authService";
import { AppRole, AuthContextType, UserWithRoles } from "@/types/auth";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  isManager: false,
  hasRole: () => false,
  refreshRoles: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadRoles = async (user: User): Promise<UserWithRoles> => {
    const roles = await fetchUserRoles(user.id);
    return { ...user, roles };
  };

  const refreshRoles = async () => {
    if (!user) return;
    
    try {
      const userWithRoles = await loadRoles(user);
      setUser(userWithRoles);
    } catch (error) {
      console.error("Error refreshing roles:", error);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          const userWithRoles = await loadRoles(session.user);
          setUser(userWithRoles);
        } catch (error) {
          console.error("Error loading user roles:", error);
          toast.error("Erreur lors du chargement des rôles utilisateur");
        }
      }
      
      setIsLoading(false);
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const userWithRoles = await loadRoles(session.user);
            setUser(userWithRoles);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      );
      
      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager'),
    hasRole,
    refreshRoles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
