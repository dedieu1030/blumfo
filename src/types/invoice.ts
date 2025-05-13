export interface TaxConfiguration {
  defaultTaxRate: string;
  region: string;
  country?: string;
  customTax?: {
    country: string;
    countryName: string;
    taxType: string;
    mainRate: number;
    additionalRates: any[];
  };
}

export interface CompanyProfile {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  businessType: 'individual' | 'company';
  vatNumber: string;
  taxRate: number;
  taxRegion: string;
  logo?: string;
  bankAccount: string;
  bankName: string;
  website: string; // Added missing website property
  emailType: 'personal' | 'professional' | 'company';
  taxConfiguration: TaxConfiguration;
  termsAndConditions: string;
  thankYouMessage: string;
  defaultCurrency: string;
  accountHolder: string;
}
