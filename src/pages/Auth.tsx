
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNavigation } from '@/components/MobileNavigation';
import { SignInComponent, SignUpComponent } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-violet rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Authentification"
        description="Connectez-vous ou créez un compte"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-background border rounded-lg shadow-sm p-6">
          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
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
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
