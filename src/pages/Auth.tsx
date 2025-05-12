
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const isVerificationPage = location.pathname.includes('verify-email-address');
  
  // Redirection si déjà connecté
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      syncUserWithSupabase();
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Synchroniser l'utilisateur avec Supabase
  const syncUserWithSupabase = async () => {
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
        password: token.substring(0, 32) // Créer un mot de passe basé sur le token (temporaire)
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
          toast.error("Erreur de synchronisation du compte");
        } else {
          console.log("Compte utilisateur créé dans Supabase");
        }
      } else {
        console.log("Utilisateur connecté dans Supabase");
      }
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
      toast.error("Erreur de synchronisation du compte");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <h1 className="font-['Space_Mono'] font-bold text-3xl tracking-tighter text-[#003427]">
                blumfo<span className="inline-flex items-center">
                  <span className="h-1.5 w-1.5 ml-0.5 rounded-full bg-[#FA7043]"></span>
                </span>
              </h1>
            </CardTitle>
            <CardDescription>
              {isVerificationPage 
                ? "Vérifiez votre adresse email" 
                : "Connectez-vous pour accéder à votre compte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVerificationPage ? (
              <div className="border rounded-lg p-4">
                {/* Clerk gère automatiquement ce composant */}
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <div className="border rounded-lg p-4">
                    <SignIn 
                      path="/auth" 
                      routing="path"
                      signUpUrl="/auth"
                      fallbackRedirectUrl="/"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="signup">
                  <div className="border rounded-lg p-4">
                    <SignUp 
                      path="/auth"
                      routing="path" 
                      signInUrl="/auth"
                      fallbackRedirectUrl="/"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
