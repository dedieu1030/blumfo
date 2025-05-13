import { useState, useEffect } from "react";
import { CompanyProfile } from "@/types/invoice";

export const useCompanyProfile = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('companyProfile');
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error("Error parsing company profile from localStorage", error);
      }
    }
  }, []);

  const saveProfile = async (profileData: Partial<CompanyProfile>) => {
    const updatedProfile = {
      ...profile,
      ...profileData,
      taxConfiguration: {
        type: profileData.taxConfiguration?.type || profile?.taxConfiguration?.type || 'region',
        rate: profileData.taxConfiguration?.rate || profile?.taxConfiguration?.rate || 0,
        defaultTaxRate: profileData.taxConfiguration?.defaultTaxRate || profile?.taxConfiguration?.defaultTaxRate || '',
        region: profileData.taxConfiguration?.region || profile?.taxConfiguration?.region || '',
        country: profileData.taxConfiguration?.country || profile?.taxConfiguration?.country || '',
        customTax: profileData.taxConfiguration?.customTax || profile?.taxConfiguration?.customTax,
      }
    };
    
    setProfile(updatedProfile as CompanyProfile);
    localStorage.setItem('companyProfile', JSON.stringify(updatedProfile));
  };

  return {
    profile,
    saveProfile
  };
};
