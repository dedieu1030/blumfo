
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyProfile } from '@/types/invoice';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Interface pour représenter les données brutes de la table companies dans Supabase
interface CompanyProfileRaw {
  id?: string;
  user_id?: string;
  company_name: string;
  address: string;
  email: string;
  email_type: 'personal' | 'professional' | 'company';
  phone: string;
  bank_account: string;
  bank_name: string;
  account_holder?: string;
  tax_rate: number;
  tax_region?: string;
  tax_configuration?: any;
  business_type: string;
  business_type_custom?: string;
  registration_number?: string;
  vat_number?: string;
  default_currency: string;
  country?: string;
  terms_and_conditions: string;
  thank_you_message: string;
  logo?: string;
  logo_url?: string;
  color?: string;
  paypal?: string;
  payoneer?: string;
  stripe_connected?: boolean;
  stripe_account_id?: string;
  created_at?: string;
  updated_at?: string;
  website?: string;
  profile_type?: 'personal' | 'business';
  profile_subtype?: string;
}

// Fonction pour convertir les données brutes vers le format CompanyProfile
function mapRawToCompanyProfile(raw: CompanyProfileRaw): CompanyProfile {
  return {
    id: raw.id,
    userId: raw.user_id,
    name: raw.company_name,
    address: raw.address,
    email: raw.email,
    emailType: raw.email_type,
    phone: raw.phone,
    bankAccount: raw.bank_account,
    bankName: raw.bank_name,
    accountHolder: raw.account_holder,
    taxRate: raw.tax_rate,
    taxRegion: raw.tax_region,
    taxConfiguration: raw.tax_configuration,
    businessType: raw.business_type,
    businessTypeCustom: raw.business_type_custom,
    registrationNumber: raw.registration_number,
    vatNumber: raw.vat_number,
    defaultCurrency: raw.default_currency,
    country: raw.country,
    termsAndConditions: raw.terms_and_conditions,
    thankYouMessage: raw.thank_you_message,
    logo: raw.logo,
    logoUrl: raw.logo_url,
    color: raw.color,
    paypal: raw.paypal,
    payoneer: raw.payoneer,
    stripeConnected: raw.stripe_connected,
    stripeAccountId: raw.stripe_account_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    website: raw.website,
    profileType: raw.profile_type,
    profileSubtype: raw.profile_subtype,
  };
}

// Fonction pour convertir CompanyProfile vers le format de la base de données
function mapCompanyProfileToRaw(profile: CompanyProfile): CompanyProfileRaw {
  return {
    id: profile.id,
    user_id: profile.userId,
    company_name: profile.name,
    address: profile.address,
    email: profile.email,
    email_type: profile.emailType as 'personal' | 'professional' | 'company',
    phone: profile.phone,
    bank_account: profile.bankAccount,
    bank_name: profile.bankName,
    account_holder: profile.accountHolder,
    tax_rate: profile.taxRate || 0, // Valeur par défaut à 0 si non définie
    tax_region: profile.taxRegion,
    tax_configuration: profile.taxConfiguration,
    business_type: profile.businessType,
    business_type_custom: profile.businessTypeCustom,
    registration_number: profile.registrationNumber,
    vat_number: profile.vatNumber,
    default_currency: profile.defaultCurrency,
    country: profile.country,
    terms_and_conditions: profile.termsAndConditions,
    thank_you_message: profile.thankYouMessage,
    logo: profile.logo,
    logo_url: profile.logoUrl,
    color: profile.color,
    paypal: profile.paypal,
    payoneer: profile.payoneer,
    stripe_connected: profile.stripeConnected,
    stripe_account_id: profile.stripeAccountId,
    website: profile.website,
    profile_type: profile.profileType as 'personal' | 'business',
    profile_subtype: profile.profileSubtype,
  };
}

export function useCompanyProfile() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Ensure data has all required properties for CompanyProfileRaw
        const rawData: CompanyProfileRaw = {
          ...data,
          tax_rate: data.tax_rate ?? 0,
          company_name: data.company_name || '',
          address: data.address || '',
          email: data.email || '',
          email_type: (data.email_type as 'personal' | 'professional' | 'company') || 'professional',
          phone: data.phone || '',
          bank_account: data.bank_account || '',
          bank_name: data.bank_name || '',
          business_type: data.business_type || '',
          default_currency: data.default_currency || 'EUR',
          terms_and_conditions: data.terms_and_conditions || '',
          thank_you_message: data.thank_you_message || ''
        };
        
        // Convertir les données brutes vers le format CompanyProfile
        const profileData = mapRawToCompanyProfile(rawData);
        setCompanyProfile(profileData);
        
        // Mise à jour du localStorage pour maintenir la compatibilité avec le reste de l'app
        localStorage.setItem('companyProfile', JSON.stringify(profileData));
      } else {
        // Si aucun profil n'existe dans la base de données, vérifier s'il y en a un en local
        const localProfile = localStorage.getItem('companyProfile');
        if (localProfile) {
          // Profil local trouvé, essayer de le sauvegarder en base de données
          const parsedProfile = JSON.parse(localProfile);
          
          // Assurer la compatibilité avec l'userId
          if (!parsedProfile.userId) {
            parsedProfile.userId = user.id;
          }
          
          // S'assurer que taxRate est défini pour éviter les erreurs de type
          if (parsedProfile.taxRate === undefined) {
            parsedProfile.taxRate = 0;
          }
          
          await saveCompanyProfile(parsedProfile);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil d\'entreprise:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyProfile = async (profile: CompanyProfile) => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user?.id) {
        throw new Error('Vous devez être connecté pour enregistrer un profil d\'entreprise');
      }

      // S'assurer que le profil est associé à l'utilisateur actuel
      profile.userId = user.id;
      
      // S'assurer que taxRate est défini pour éviter les erreurs de type
      if (profile.taxRate === undefined) {
        profile.taxRate = 0;
      }
      
      // Convertir le profil au format compatible avec la base de données
      const rawProfile = mapCompanyProfileToRaw(profile);
      
      let result;
      if (profile.id) {
        // Mise à jour d'un profil existant
        const { data, error: updateError } = await supabase
          .from('companies')
          .update({
            ...rawProfile,
            tax_rate: rawProfile.tax_rate, // Explicitly set tax_rate to ensure it's included
            company_name: rawProfile.company_name || profile.name || '',
            address: rawProfile.address || '',
            email: rawProfile.email || '',
            email_type: rawProfile.email_type || 'professional',
            phone: rawProfile.phone || '',
            bank_account: rawProfile.bank_account || '',
            bank_name: rawProfile.bank_name || '',
            business_type: rawProfile.business_type || '',
            default_currency: rawProfile.default_currency || 'EUR',
            terms_and_conditions: rawProfile.terms_and_conditions || '',
            thank_you_message: rawProfile.thank_you_message || ''
          })
          .eq('id', profile.id)
          .eq('user_id', user.id) // S'assurer que l'utilisateur ne modifie que son propre profil
          .select()
          .single();

        if (updateError) throw updateError;
        
        // Ensure data has all required properties
        const rawResult: CompanyProfileRaw = {
          ...data,
          tax_rate: data.tax_rate ?? 0,
          company_name: data.company_name || '',
          address: data.address || '',
          email: data.email || '',
          email_type: (data.email_type as 'personal' | 'professional' | 'company') || 'professional',
          phone: data.phone || '',
          bank_account: data.bank_account || '',
          bank_name: data.bank_name || '',
          business_type: data.business_type || '',
          default_currency: data.default_currency || 'EUR',
          terms_and_conditions: data.terms_and_conditions || '',
          thank_you_message: data.thank_you_message || ''
        };
        
        result = mapRawToCompanyProfile(rawResult);
      } else {
        // Création d'un nouveau profil
        const { data, error: insertError } = await supabase
          .from('companies')
          .insert({
            ...rawProfile,
            tax_rate: rawProfile.tax_rate, // Explicitly set tax_rate to ensure it's included
            company_name: rawProfile.company_name || profile.name || '',
            address: rawProfile.address || '',
            email: rawProfile.email || '',
            email_type: rawProfile.email_type || 'professional',
            phone: rawProfile.phone || '',
            bank_account: rawProfile.bank_account || '',
            bank_name: rawProfile.bank_name || '',
            business_type: rawProfile.business_type || '',
            default_currency: rawProfile.default_currency || 'EUR',
            terms_and_conditions: rawProfile.terms_and_conditions || '',
            thank_you_message: rawProfile.thank_you_message || ''
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Ensure data has all required properties
        const rawResult: CompanyProfileRaw = {
          ...data,
          tax_rate: data.tax_rate ?? 0,
          company_name: data.company_name || '',
          address: data.address || '',
          email: data.email || '',
          email_type: (data.email_type as 'personal' | 'professional' | 'company') || 'professional',
          phone: data.phone || '',
          bank_account: data.bank_account || '',
          bank_name: data.bank_name || '',
          business_type: data.business_type || '',
          default_currency: data.default_currency || 'EUR',
          terms_and_conditions: data.terms_and_conditions || '',
          thank_you_message: data.thank_you_message || ''
        };
        
        result = mapRawToCompanyProfile(rawResult);
      }

      // Mettre à jour l'état local et le localStorage
      setCompanyProfile(result);
      localStorage.setItem('companyProfile', JSON.stringify(result));
      
      return { success: true, data: result };
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du profil d\'entreprise:', err);
      setError(err);
      
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, user?.id]);

  return { 
    companyProfile, 
    loading, 
    error, 
    saveCompanyProfile,
    refreshProfile: fetchCompanyProfile 
  };
}
