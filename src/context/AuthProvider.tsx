
import React, { createContext, useContext, ReactNode } from 'react';
import { useClerkSupabase } from '@/hooks/use-clerk-supabase';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null | undefined;
  userDetails: any;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useClerkSupabase();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  
  return context;
}
