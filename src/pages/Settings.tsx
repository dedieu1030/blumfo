
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
import { supabase } from "@/integrations/supabase/client";

// Import des composants de paramètres
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { PaymentTermsSettings } from "@/components/settings/PaymentTermsSettings";
import { TaxSettings } from "@/components/settings/TaxSettings";
import { InvoiceTemplateSettings } from "@/components/settings/InvoiceTemplateSettings";
import { ReminderSettings } from "@/components/settings/ReminderSettings";

export default function Settings() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // État du profil
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({});
  const [hasProfile, setHasProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les données du profil d'entreprise depuis Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        
        // Tenter de récupérer le profil depuis Supabase
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .single();
        
        if (error) {
          console.error("Erreur lors de la récupération du profil:", error);
          
          // Vérifier si on a des données en localStorage comme fallback
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
        } else if (data) {
          // Convertir les données de la base en format CompanyProfile
          setCompanyProfile({
            id: data.id,
            name: data.name || "",
            address: data.address || "",
            email: data.email || "",
            emailType: data.email_type as "personal" | "professional" | "company" || "company",
            phone: data.phone || "",
            bankAccount: data.bank_account || "",
            bankName: data.bank_name || "",
            accountHolder: data.account_holder || "",
            taxRate: data.tax_rate || "20",
            termsAndConditions: data.terms_and_conditions || "Paiement sous 30 jours. Pénalité 1.5%/mois en cas de retard.",
            thankYouMessage: data.thank_you_message || "Merci pour votre confiance",
            defaultCurrency: data.default_currency || "EUR",
            businessType: data.business_type || "company",
            businessTypeCustom: data.business_type_custom || "",
          });
          setHasProfile(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, []);

  const handleSaveProfile = async (profile: CompanyProfile) => {
    try {
      // Obtenir l'ID utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }

      // Convertir le profil au format de la base de données
      const dbProfile = {
        id: user.id, // Ajouter l'ID utilisateur
        name: profile.name,
        address: profile.address,
        email: profile.email,
        email_type: profile.emailType,
        phone: profile.phone,
        bank_account: profile.bankAccount,
        bank_name: profile.bankName,
        account_holder: profile.accountHolder,
        tax_rate: profile.taxRate,
        terms_and_conditions: profile.termsAndConditions,
        thank_you_message: profile.thankYouMessage,
        default_currency: profile.defaultCurrency,
        business_type: profile.businessType,
        business_type_custom: profile.businessTypeCustom,
      };
      
      // Sauvegarder dans Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert(dbProfile);
        
      if (error) {
        console.error("Erreur lors de la sauvegarde du profil:", error);
        throw error;
      }
      
      // Mettre à jour l'état local
      setCompanyProfile(profile);
      setHasProfile(true);
      setIsCreatingProfile(false);
      setIsEditingProfile(false);
      
      // Conserver aussi dans localStorage pour la compatibilité
      localStorage.setItem('companyProfile', JSON.stringify(profile));
      
      // Afficher une notification de succès
      toast({
        title: "Succès",
        description: "Profil enregistré avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du profil",
        variant: "destructive"
      });
    }
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
          <TabsTrigger 
            value="templates"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="reminders"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Relances
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !hasProfile && !isCreatingProfile ? (
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
          <TaxSettings companyProfile={hasProfile ? companyProfile as CompanyProfile : undefined} />
        </TabsContent>
        
        <TabsContent value="payment-terms">
          <PaymentTermsSettings />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentSettings companyProfile={hasProfile ? companyProfile as CompanyProfile : undefined} />
        </TabsContent>

        <TabsContent value="templates">
          <InvoiceTemplateSettings />
        </TabsContent>

        <TabsContent value="reminders">
          <ReminderSettings />
        </TabsContent>
      </Tabs>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
