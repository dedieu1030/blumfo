
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  
  // Redirection si déjà connecté
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("Utilisateur déjà connecté, redirection vers la page d'accueil");
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

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
              Connectez-vous pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <div className="border rounded-lg p-4">
                  <SignIn 
                    routing="path" 
                    path="/auth"
                    signUpUrl="/auth"
                    forceRedirectUrl="/"
                  />
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <div className="border rounded-lg p-4">
                  <SignUp 
                    routing="path" 
                    path="/auth" 
                    signInUrl="/auth"
                    forceRedirectUrl="/"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
