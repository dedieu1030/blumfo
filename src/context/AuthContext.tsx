
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useClerkSupabase } from '@/hooks/use-clerk-supabase';
import { UserProfile } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: UserProfile | null;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean, data?: any, error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: clerkLoading, userId } = useClerkSupabase();
  const { profile, loading: profileLoading, error, updateProfile } = useUserProfile();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Marquer comme initialisé après le premier chargement
    if (!clerkLoading && !profileLoading) {
      setIsInitialized(true);
    }
  }, [clerkLoading, profileLoading]);

  const value = {
    isAuthenticated,
    loading: clerkLoading || profileLoading || !isInitialized,
    user: profile,
    error,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

export function SignInComponent() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-violet hover:bg-violet/90 text-white",
            card: "shadow-md rounded-lg",
            headerTitle: "text-xl font-semibold text-center"
          }
        }}
        redirectUrl="/profile"
      />
    </div>
  );
}

export function SignUpComponent() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-violet hover:bg-violet/90 text-white",
            card: "shadow-md rounded-lg",
            headerTitle: "text-xl font-semibold text-center"
          }
        }}
        redirectUrl="/profile"
      />
    </div>
  );
}
