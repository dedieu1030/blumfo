
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNavigation } from '@/components/MobileNavigation';
import { SignInComponent, SignUpComponent } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function Auth() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/profile');
    }
  }, [isSignedIn, navigate]);

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
