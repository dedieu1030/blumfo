
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
import { supabase } from "@/integrations/supabase/client";

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

  // Récupérer les données du profil d'entreprise
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        // Essayer de récupérer d'abord depuis Supabase si connecté
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();
            
          if (data && !error) {
            // Convertir les champs snake_case en camelCase
            const profile: CompanyProfile = {
              id: data.id,
              name: data.name,
              address: data.address || '',
              email: data.email,
              emailType: data.email_type as "personal" | "professional" | "company",
              phone: data.phone || '',
              bankAccount: data.bank_account || '',
              bankName: data.bank_name || '',
              accountHolder: data.account_holder || '',
              taxRate: data.tax_rate || '',
              logo: data.logo,
              termsAndConditions: data.terms_and_conditions || '',
              thankYouMessage: data.thank_you_message || '',
              defaultCurrency: data.default_currency || 'EUR',
              businessType: data.business_type as CompanyProfile['businessType'],
              businessTypeCustom: data.business_type_custom,
              paypal: data.paypal,
              payoneer: data.payoneer,
              profileType: data.profile_type as "personal" | "business",
              profileSubtype: data.profile_subtype,
              taxCountry: data.tax_country,
              taxRegion: data.tax_region
            };
            
            setCompanyProfile(profile);
            setHasProfile(true);
            return;
          }
        }
        
        // Si pas de données dans Supabase ou pas connecté, essayer localStorage
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
      } catch (error) {
        console.error("Erreur lors de la récupération du profil", error);
      }
    };
    
    fetchCompanyProfile();
  }, []);

  const handleSaveProfile = async (profile: CompanyProfile) => {
    try {
      // Essayer de sauvegarder dans Supabase si connecté
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const profileToSave = {
          id: profile.id, // Utiliser l'ID existant si présent
          user_id: userData.user.id,
          name: profile.name,
          address: profile.address,
          email: profile.email,
          email_type: profile.emailType,
          phone: profile.phone,
          bank_account: profile.bankAccount,
          bank_name: profile.bankName,
          account_holder: profile.accountHolder,
          tax_rate: profile.taxRate,
          logo: profile.logo,
          terms_and_conditions: profile.termsAndConditions,
          thank_you_message: profile.thankYouMessage,
          default_currency: profile.defaultCurrency,
          business_type: profile.businessType,
          business_type_custom: profile.businessTypeCustom,
          paypal: profile.paypal,
          payoneer: profile.payoneer,
          profile_type: profile.profileType,
          profile_subtype: profile.profileSubtype,
          tax_country: profile.taxCountry,
          tax_region: profile.taxRegion
        };
        
        // Utiliser upsert pour insérer ou mettre à jour
        const { data, error } = await supabase
          .from('company_profiles')
          .upsert(profileToSave, { 
            onConflict: 'user_id', 
            ignoreDuplicates: false 
          })
          .select();
          
        if (error) {
          console.error("Erreur lors de la sauvegarde du profil:", error);
          toast({
            title: "Erreur",
            description: "Impossible de sauvegarder le profil dans la base de données",
            variant: "destructive"
          });
          // Enregistrer localement en cas d'erreur
          localStorage.setItem('companyProfile', JSON.stringify(profile));
        } else {
          console.log("Profil sauvegardé dans Supabase:", data);
          // Récupérer l'ID généré si c'était une insertion
          if (data && data.length > 0) {
            profile.id = data[0].id;
          }
        }
      } else {
        // Si pas connecté, sauvegarder localement
        localStorage.setItem('companyProfile', JSON.stringify(profile));
      }
      
      setCompanyProfile(profile);
      setHasProfile(true);
      setIsCreatingProfile(false);
      setIsEditingProfile(false);
      
      // Afficher une notification de succès
      toast({
        title: "Succès",
        description: "Profil enregistré avec succès"
      });
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du profil",
        variant: "destructive"
      });
      // Essayer de sauvegarder localement malgré tout
      localStorage.setItem('companyProfile', JSON.stringify(profile));
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
          <TaxSettings companyProfile={hasProfile ? companyProfile as CompanyProfile : undefined} />
        </TabsContent>
        
        <TabsContent value="payment-terms">
          <PaymentTermsSettings />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentSettings companyProfile={hasProfile ? companyProfile as CompanyProfile : undefined} />
        </TabsContent>
      </Tabs>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
