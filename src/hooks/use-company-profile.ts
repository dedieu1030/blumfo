
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyProfile, CompanyProfileRaw, EmailType, ProfileType } from '@/types/user';

// Convert raw database profile to frontend format
const mapDatabaseToFrontend = (profile: CompanyProfileRaw): CompanyProfile => {
  return {
    id: profile.id,
    name: profile.company_name,
    address: profile.address || '',
    email: profile.email || '',
    // Handle email_type with proper type casting
    emailType: (profile.email_type as EmailType) || 'professional',
    phone: profile.phone || '',
    bankAccount: profile.bank_account || '',
    bankName: profile.bank_name || '',
    businessType: profile.business_type || 'company',
    businessTypeCustom: profile.business_type_custom,
    accountHolder: profile.account_holder || '',
    // Handle profile_type with proper type casting
    profileType: (profile.profile_type as ProfileType) || 'business',
    // Handle tax_rate property which might be undefined
    taxRate: profile.tax_rate !== undefined ? Number(profile.tax_rate) : 0,
    taxRegion: profile.taxRegion,
    termsAndConditions: profile.termsAndConditions,
    thankYouMessage: profile.thankYouMessage,
    defaultCurrency: profile.defaultCurrency || 'EUR',
    country: profile.country || 'FR',
    userId: profile.user_id,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    website: profile.website || null,
    vatNumber: profile.vat_number,
    taxConfiguration: profile.tax_configuration
  };
};

// Convert frontend format to raw database profile
const mapFrontendToDatabase = (profile: CompanyProfile): CompanyProfileRaw => {
  return {
    company_name: profile.name,
    address: profile.address,
    email: profile.email,
    email_type: profile.emailType,
    phone: profile.phone,
    bank_account: profile.bankAccount,
    bank_name: profile.bankName,
    business_type: profile.businessType,
    business_type_custom: profile.businessTypeCustom,
    account_holder: profile.accountHolder,
    profile_type: profile.profileType,
    // Ensure tax_rate is included
    tax_rate: typeof profile.taxRate === 'number' ? profile.taxRate : 0,
    taxRegion: profile.taxRegion,
    termsAndConditions: profile.termsAndConditions,
    thankYouMessage: profile.thankYouMessage,
    defaultCurrency: profile.defaultCurrency,
    country: profile.country,
    user_id: profile.userId,
    website: profile.website,
    vat_number: profile.vatNumber,
    tax_configuration: profile.taxConfiguration
  };
};

// Hook for managing company profile
export const useCompanyProfile = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch company profile from localStorage or database
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get from localStorage
      const localProfile = localStorage.getItem('companyProfile');
      if (localProfile) {
        const parsedProfile = JSON.parse(localProfile);
        setProfile(parsedProfile);
        setLoading(false);
        return;
      }

      // If not in localStorage, try to get from database
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching company profile:', error);
        setError('Failed to fetch company profile');
        setLoading(false);
        return;
      }

      if (data) {
        // Make sure we have a properly typed object by casting and adding missing properties
        // TypeScript sometimes doesn't recognize properties in the returned data
        const safeData = data as any;
        
        // Create a safe copy with all required properties
        const dataWithDefaults: CompanyProfileRaw = {
          ...safeData,
          email_type: (safeData.email_type as EmailType) || 'professional',
          profile_type: (safeData.profile_type as ProfileType) || 'business',
          tax_rate: safeData.tax_rate !== undefined ? Number(safeData.tax_rate) : 0,
          company_name: safeData.company_name || '',
          address: safeData.address || '',
          email: safeData.email || '',
          phone: safeData.phone || '',
          bank_account: safeData.bank_account || '',
          bank_name: safeData.bank_name || '',
          business_type: safeData.business_type || 'company',
          account_holder: safeData.account_holder || ''
        };
        
        const mappedProfile = mapDatabaseToFrontend(dataWithDefaults);
        
        setProfile(mappedProfile);
        // Also store in localStorage for faster access
        localStorage.setItem('companyProfile', JSON.stringify(mappedProfile));
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Save profile to database and localStorage
  const saveProfile = async (profileData: CompanyProfile) => {
    setLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return null;
      }

      // Prepare data for database, ensuring it has the tax_rate property 
      const dbProfileBase = mapFrontendToDatabase({
        ...profileData,
        userId: user.user.id
      });

      // Make sure we have the correct type for email_type and profile_type
      // and that tax_rate is properly set
      const dbDataToSave: CompanyProfileRaw = {
        ...dbProfileBase,
        email_type: dbProfileBase.email_type,
        profile_type: dbProfileBase.profile_type,
        tax_rate: typeof dbProfileBase.tax_rate === 'number' ? dbProfileBase.tax_rate : 0,
        user_id: user.user.id,
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await supabase
        .from('companies')
        .upsert(dbDataToSave)
        .select()
        .single();

      if (error) {
        console.error('Error saving company profile:', error);
        setError('Failed to save company profile');
        setLoading(false);
        return null;
      }

      // Cast and ensure the response has all expected fields
      const safeData = data as any;
      
      // Create a safe copy with all required properties
      const dataWithDefaults: CompanyProfileRaw = {
        ...safeData,
        email_type: (safeData.email_type as EmailType) || 'professional',
        profile_type: (safeData.profile_type as ProfileType) || 'business',
        tax_rate: safeData.tax_rate !== undefined ? Number(safeData.tax_rate) : 0,
        company_name: safeData.company_name || '',
        address: safeData.address || '',
        email: safeData.email || '',
        phone: safeData.phone || '',
        bank_account: safeData.bank_account || '',
        bank_name: safeData.bank_name || '',
        business_type: safeData.business_type || 'company',
        account_holder: safeData.account_holder || ''
      };
      
      const updatedProfile = mapDatabaseToFrontend(dataWithDefaults);

      setProfile(updatedProfile);
      // Update localStorage
      localStorage.setItem('companyProfile', JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (err) {
      console.error('Error in saveProfile:', err);
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update local profile without saving to database
  const updateLocalProfile = (profileData: CompanyProfile) => {
    setProfile(profileData);
    localStorage.setItem('companyProfile', JSON.stringify(profileData));
  };

  // Load profile on initial mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    saveProfile,
    updateLocalProfile
  };
};

export default useCompanyProfile;
