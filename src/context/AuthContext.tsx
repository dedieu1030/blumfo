import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { toast } from 'sonner';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: UserProfile | null;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean, data?: any, error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading, error, updateProfile } = useUserProfile();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Configuration initiale: vérifier la session et configurer les écouteurs d'événements
    const setupAuth = async () => {
      setLoading(true);
      
      // Récupérer la session existante
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      // Configurer l'écouteur pour les changements d'état d'authentification
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setSupabaseUser(session?.user ?? null);
        }
      );
      
      setLoading(false);
      
      // Nettoyer l'abonnement lors du démontage du composant
      return () => subscription.unsubscribe();
    };
    
    setupAuth();
  }, []);

  useEffect(() => {
    // Marquer comme initialisé après le premier chargement
    if (!loading && !profileLoading) {
      setIsInitialized(true);
    }
  }, [loading, profileLoading]);

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Vous êtes maintenant déconnecté');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const value = {
    isAuthenticated: !!session,
    loading: loading || profileLoading || !isInitialized,
    user: profile,
    error,
    updateProfile,
    signOut,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
      toast.error(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSignIn} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            disabled={loading}
            placeholder="votre@email.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
            <a href="#" className="text-xs text-violet hover:underline">Mot de passe oublié ?</a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet hover:bg-violet/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export function SignUpComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        } 
      });

      if (error) throw error;
      
      setSuccessMessage('Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.');
      toast.success('Inscription réussie!');
    } catch (err: any) {
      console.error('Erreur d\'inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      toast.error(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-2">Nom complet</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            disabled={loading}
            placeholder="Jean Dupont"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            disabled={loading}
            placeholder="votre@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 6 caractères
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet hover:bg-violet/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
}
