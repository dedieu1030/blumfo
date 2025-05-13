
import { useState, useEffect } from "react";
import { CompanyProfile } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { CustomTaxConfiguration } from "@/types/tax";

export const useCompanyProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement du profil depuis le stockage local
  const loadProfile = () => {
    setLoading(true);
    try {
      const savedProfile = localStorage.getItem('companyProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as CompanyProfile;
        setProfile(parsedProfile);
      } else {
        setProfile(null);
      }
      setError(null);
    } catch (e) {
      console.error("Erreur lors du chargement du profil:", e);
      setError("Impossible de charger le profil d'entreprise");
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil d'entreprise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde du profil dans le stockage local
  const saveProfile = (profileData: CompanyProfile) => {
    try {
      // Assurons-nous que toutes les propriétés requises sont présentes
      const completeProfile: CompanyProfile = {
        name: profileData.name || "",
        address: profileData.address || "",
        phone: profileData.phone || "",
        email: profileData.email || "",
        emailType: profileData.emailType || "professional",
        accountHolder: profileData.accountHolder || "",
        bankAccount: profileData.bankAccount || "",
        bankName: profileData.bankName || "",
        taxRate: profileData.taxRate || 0,
        taxRegion: profileData.taxRegion || "",
        country: profileData.country || "FR",
        thankYouMessage: profileData.thankYouMessage || "Merci pour votre confiance",
        termsAndConditions: profileData.termsAndConditions || "Paiement sous 30 jours",
        defaultCurrency: profileData.defaultCurrency || "EUR",
        businessType: profileData.businessType || "company",
        website: profileData.website || "",
        paypal: profileData.paypal || "",
        payoneer: profileData.payoneer || "",
        businessTypeCustom: profileData.businessTypeCustom,
        taxConfiguration: profileData.taxConfiguration || {
          defaultTaxRate: profileData.taxRate?.toString() || "20",
          region: profileData.taxRegion || "",
          country: profileData.country || "FR"
        },
        ...profileData
      };
      
      localStorage.setItem('companyProfile', JSON.stringify(completeProfile));
      setProfile(completeProfile);
      
      toast({
        title: "Profil enregistré",
        description: "Les informations du profil ont été mises à jour avec succès"
      });
      
      return true;
    } catch (e) {
      console.error("Erreur lors de la sauvegarde du profil:", e);
      
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le profil d'entreprise",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile();
  }, []);

  // Mettre à jour la configuration fiscale avec des paramètres personnalisés
  const updateTaxConfig = (
    taxRate: number, 
    region: string, 
    customTax?: CustomTaxConfiguration
  ) => {
    if (!profile) return false;
    
    const updatedProfile = {
      ...profile,
      taxRate: taxRate,
      taxRegion: region,
      taxConfiguration: {
        defaultTaxRate: taxRate.toString(),
        region: region,
        country: profile.country || "FR",
        customTax: customTax
      }
    };
    
    return saveProfile(updatedProfile);
  };
  
  return {
    profile,
    loading,
    error,
    loadProfile,
    saveProfile,
    updateTaxConfig
  };
};
