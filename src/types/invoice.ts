
export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  emailType: "personal" | "professional" | "company";
  phone: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxRate: string;
  logo?: string;
  termsAndConditions: string;
  thankYouMessage: string;
  defaultCurrency: string;
  businessType?: "company" | "individual" | "lawyer" | "freelancer" | "other";
  businessTypeCustom?: string; // Pour "other"
  paypal?: string;
  payoneer?: string;
  profileType?: "personal" | "business";
  profileSubtype?: string;
  // Nouveaux champs pour la configuration fiscale
  taxCountry?: string;
  taxRegion?: string;
}

export type PaymentMethod = "card" | "transfer" | "paypal" | "check" | "cash" | "payoneer" | "other";

export interface PaymentMethodDetails {
  type: PaymentMethod;
  enabled: boolean;
  details?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string; // "immediate", "7", "15", "30", "45", "60", "90", "custom"
  customDate?: string; // for custom date if delay is "custom"
  termsText: string;
  isDefault: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone?: string;
  issuerInfo: CompanyProfile;
  serviceLines: ServiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentDelay: string;
  paymentMethods: PaymentMethodDetails[];
  notes: string;
  signature?: string;
  templateId: string;
  paymentTermsId?: string;
  customPaymentTerms?: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  tva: string;
  total: string;
}

// Interfaces pour la configuration des relances automatiques
export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: ReminderTrigger[];
  isDefault?: boolean;
}

export interface ReminderTrigger {
  id: string;
  triggerType: "days_before_due" | "days_after_due" | "days_after_previous_reminder" | "specific_date";
  triggerValue: number; // Nombre de jours ou timestamp pour specific_date
  emailTemplateId?: string;
  emailSubject: string;
  emailBody: string;
}

// Configuration de la numérotation des factures
export interface InvoiceNumberingConfig {
  prefix: string;
  nextNumber: number;
  suffix?: string;
  padding: number; // Nombre de zéros pour le remplissage (ex: 001, 0001)
  resetAnnually: boolean;
}

// Liste étendue des devises
export type Currency = 
  "EUR" | "USD" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | 
  "CNY" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | 
  "RON" | "BGN" | "TRY" | "RUB" | "ZAR" | "INR" | "BRL" | 
  "MXN" | "ARS" | "CLP" | "PEN" | "COP";

// Information sur les devises
export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  position: "prefix" | "suffix";
}

// Type DbClient pour correspondre exactement à la structure de la table clients dans Supabase
export interface DbClient {
  id: string;
  client_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string | null;
  company_id?: string | null;
  group_id?: string | null;
  reference_number?: string | null;
}

// Adding Notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

// Adding Client type to avoid import issues
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  invoiceCount?: number;
}

// Adding Product type to avoid import issues
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  tax_rate: number | null;
  is_recurring: boolean;
  recurring_interval: 'day' | 'week' | 'month' | 'year' | null;
  recurring_interval_count: number | null;
  product_type: 'product' | 'service' | null;
  active: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  category_id?: string;
  category_name?: string;
}
