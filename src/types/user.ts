export interface UserProfile {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  email: string;
  phone?: string;
  language: string;
  timezone: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Define the email type options
export type EmailType = "personal" | "professional" | "company";

// Define the profile type options
export type ProfileType = "personal" | "business";

// Define the CompanyProfile type that includes taxRate
export interface CompanyProfileRaw {
  id?: string;
  company_name: string;
  address: string;
  email: string;
  email_type: EmailType;
  phone: string;
  bank_account: string;
  bank_name: string;
  business_type: string;
  business_type_custom?: string;
  account_holder: string;
  profile_type: ProfileType;
  taxRate?: number;
  tax_rate: number; // Make sure tax_rate is required, not optional
  taxRegion?: string;
  termsAndConditions?: string;
  thankYouMessage?: string;
  defaultCurrency?: string;
  country?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  website?: string | null;
  vat_number?: string;
  tax_configuration?: any;
}

// Define a simplified version for frontend use
export interface CompanyProfile {
  id?: string;
  name: string;
  address: string;
  email: string;
  emailType: EmailType;
  phone: string;
  bankAccount: string;
  bankName: string;
  businessType: string;
  businessTypeCustom?: string;
  accountHolder: string;
  profileType: ProfileType;
  taxRate: number;
  taxRegion?: string;
  termsAndConditions?: string;
  thankYouMessage?: string;
  defaultCurrency?: string;
  country?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  website?: string | null;
  vatNumber?: string;
  taxConfiguration?: any;
}
