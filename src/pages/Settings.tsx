
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
import { useCompanyProfile } from "@/hooks/use-company-profile";

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
  
  // État du profil en utilisant le hook personnalisé
  const { companyProfile, loading, error, fetchProfile, saveProfile } = useCompanyProfile();
  const [hasProfile, setHasProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Surveillance du chargement du profil
  useEffect(() => {
    if (companyProfile) {
      setHasProfile(true);
    }
  }, [companyProfile]);

  // Function to handle profile updates
  const handleProfileUpdate = async (updatedProfile: CompanyProfile) => {
    const result = await saveProfile(updatedProfile);
    
    if (result.success) {
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès."
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive"
      });
    }
  };

  // Function to handle profile creation/save
  const handleSaveProfile = async (profile: CompanyProfile) => {
    const result = await saveProfile(profile);
    
    if (result.success) {
      setHasProfile(true);
      setIsCreatingProfile(false);
      setIsEditingProfile(false);
      
      toast({
        title: "Profil créé",
        description: "Votre profil a été créé avec succès."
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Une erreur est survenue lors de la création du profil",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Une erreur s'est produite</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <Button onClick={fetchProfile} className="mt-4">Réessayer</Button>
        </div>
      </div>
    );
  }

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
          <PaymentTermsSettings />
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
