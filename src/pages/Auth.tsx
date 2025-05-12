
import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state?.from?.pathname) || '/';

  const handleRedirect = () => {
    // Rediriger l'utilisateur après l'authentification réussie
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="font-['Space_Mono'] font-bold text-3xl tracking-tighter text-[#003427]">
            blumfo<span className="inline-flex items-center">
              <span className="h-1.5 w-1.5 ml-0.5 rounded-full bg-[#FA7043]"></span>
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos factures en toute simplicité
          </p>
        </div>
        
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: "bg-violet hover:bg-violet/90",
                  card: "shadow-none p-0",
                  footer: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-input",
                  formFieldInput: "rounded-md border border-input",
                }
              }} 
              redirectUrl={from}
              signUpUrl="/auth?tab=signup"
            />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: "bg-violet hover:bg-violet/90",
                  card: "shadow-none p-0",
                  footer: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-input",
                  formFieldInput: "rounded-md border border-input",
                }
              }}
              redirectUrl={from}
              signInUrl="/auth?tab=signin"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
