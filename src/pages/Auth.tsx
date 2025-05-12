
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInComponent, SignUpComponent } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [activeTab, setActiveTab] = useState("signin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoaded(true);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsLoaded(true);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      navigate('/profile');
    }
  }, [isLoaded, isAuthenticated, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-violet rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Section gauche: formulaire d'authentification */}
      <div className="w-full lg:w-1/2 flex flex-col py-12 px-8 md:px-16 lg:px-24 bg-background">
        <div className="mb-12 mt-8">
          <h1 className="font-['Space_Mono'] font-bold text-4xl tracking-tighter text-[#003427]">
            blumfo<span className="inline-flex items-center">
              <span className="h-2 w-2 ml-0.5 rounded-full bg-[#FA7043]"></span>
            </span>
          </h1>
        </div>
        
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-medium mb-2 text-foreground">Bienvenue</h2>
            <p className="text-muted-foreground">
              {activeTab === "signin" 
                ? "Connectez-vous à votre compte pour accéder à votre tableau de bord." 
                : "Créez un compte pour commencer à utiliser blumfo."}
            </p>
          </div>
          
          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInComponent />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpComponent />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-12 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} blumfo. Tous droits réservés.
        </div>
      </div>
      
      {/* Section droite: visuel / couleur de fond */}
      <div className="hidden lg:block lg:w-1/2 bg-beige relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="bg-[#003427] rounded-xl p-10 text-white max-w-md">
            <h3 className="text-2xl font-medium mb-4">
              Simplifiez votre facturation.
            </h3>
            <p className="mb-6">
              Une solution de facturation intuitive, puissante et adaptée à vos besoins.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 mt-2 mr-2 rounded-full bg-[#FA7043]"></span>
                <span>Création de factures professionnelles</span>
              </li>
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 mt-2 mr-2 rounded-full bg-[#FA7043]"></span>
                <span>Gestion simplifiée de vos clients</span>
              </li>
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 mt-2 mr-2 rounded-full bg-[#FA7043]"></span>
                <span>Suivi des paiements en temps réel</span>
              </li>
            </ul>
          </div>
          
          <div className="absolute bottom-8 text-sm text-[#003427] opacity-75">
            © {new Date().getFullYear()} blumfo. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
}
