import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyProfile } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { ProfileViewer } from "@/components/profile/ProfileViewer";
import { Plus } from "lucide-react";

// Import des composants de paramètres
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { PaymentTermsSettings } from "@/components/settings/PaymentTermsSettings";
import { TaxSettings } from "@/components/settings/TaxSettings";

export default function Settings() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // État du profil
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Récupérer les données du profil d'entreprise
  useEffect(() => {
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setCompanyProfile(profileData);
        setHasProfile(true);
      } catch (e) {
        console.error("Erreur lors du parsing du profil d'entreprise", e);
      }
    }
  }, []);

  // Function to handle profile updates
  const handleProfileUpdate = (updatedProfile: CompanyProfile) => {
    setCompanyProfile(updatedProfile);
    localStorage.setItem('companyProfile', JSON.stringify(updatedProfile));
    
    toast({
      title: "Profil mis à jour",
      description: "Vos modifications ont été enregistrées avec succès."
    });
  };

  // Function to handle profile creation/save
  const handleSaveProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    setHasProfile(true);
    setIsCreatingProfile(false);
    setIsEditingProfile(false);
    localStorage.setItem('companyProfile', JSON.stringify(profile));
    
    toast({
      title: "Profil créé",
      description: "Votre profil a été créé avec succès."
    });
  };

  // Add new function to handle payment terms saving
  const handleSavePaymentTerms = (templates: PaymentTermTemplate[]) => {
    localStorage.setItem('paymentTerms', JSON.stringify(templates));
    
    toast({
      title: "Conditions de paiement mises �� jour",
      description: "Vos modifications ont été enregistrées avec succès."
    });
  };

  return (
    <>
      <Header 
        title="Paramètres" 
        description="Personnalisez votre compte et vos préférences"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Profil
          </TabsTrigger>
          <TabsTrigger 
            value="tax"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            TVA
          </TabsTrigger>
          <TabsTrigger 
            value="payment-terms"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Conditions de paiement
          </TabsTrigger>
          <TabsTrigger 
            value="payment"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Paiements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          {!hasProfile && !isCreatingProfile ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Vous n'avez pas encore de profil</h2>
              <p className="text-muted-foreground mb-8">
                Créez votre profil professionnel pour qu'il apparaisse sur vos factures.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setIsCreatingProfile(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer mon profil
              </Button>
            </div>
          ) : isCreatingProfile || isEditingProfile ? (
            <ProfileWizard 
              initialData={isEditingProfile ? companyProfile : undefined}
              onComplete={handleSaveProfile}
              onCancel={() => {
                setIsCreatingProfile(false);
                setIsEditingProfile(false);
              }}
            />
          ) : (
            <ProfileViewer 
              profile={companyProfile as CompanyProfile}
              onEdit={() => setIsEditingProfile(true)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="tax">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Configuration de la TVA</h2>
            <p className="text-gray-500">Définissez le taux de TVA par défaut pour vos factures.</p>
            
            <div className="mt-6">
              <TaxSettings 
                companyProfile={companyProfile} 
                onSave={handleProfileUpdate}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="payment-terms">
          <PaymentTermsSettings 
            onSave={handleSavePaymentTerms} 
            initialTemplates={getDefaultPaymentTerms()} 
          />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentSettings companyProfile={companyProfile} />
        </TabsContent>
      </Tabs>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
