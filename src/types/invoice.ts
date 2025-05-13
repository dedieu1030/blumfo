
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billTo: string;
  billToEmail: string;
  billToAddress: string;
  shipTo: string;
  shipToEmail: string;
  shipToAddress: string;
  amount: number;
  balance: number;
  status: 'paid' | 'unpaid' | 'draft';
  // Propriétés manquantes qui causent des erreurs
  total: number;
  items?: InvoiceItem[];
  paymentMethods?: PaymentMethodDetails[];
  issuerInfo?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
  };
  notes?: string;
  clientName?: string;
  issueDate?: string;
  signature?: SignatureData;
  signatureDate?: string;
}

export interface CustomTaxConfiguration {
  name: string;
  rate: number;
  country?: string;
  countryName?: string;
  taxType?: string;
  mainRate?: number;
  additionalRates?: Array<{name: string, rate: number}>;
}

export interface TaxConfiguration {
  defaultTaxRate: string;
  region: string; // Cette propriété doit être obligatoire
  country: string;
  customTax?: CustomTaxConfiguration;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  emailType: 'personal' | 'professional' | 'company';
  accountHolder: string;
  bankAccount: string;
  bankName: string;
  taxRate: number;
  taxRegion?: string;
  country?: string;
  thankYouMessage: string;
  termsAndConditions: string;
  defaultCurrency: string;
  businessType: string;
  businessTypeCustom?: string;
  paypal?: string;
  payoneer?: string;
  website?: string;
  stripeAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Configuration fiscale
  taxConfiguration?: TaxConfiguration;
  // Propriétés pour ProfileWizard et ProfileViewer
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Types manquants qui causent des erreurs
export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  enabled: boolean;
  details?: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  description?: string;
  daysAfterIssue: number;
  isDefault?: boolean;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  amount?: number;
  description?: string;
}

export interface SignatureData {
  dataUrl: string;
  signedBy?: string;
  signedDate?: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  isDefault?: boolean;
  triggers: ReminderTrigger[];
}

export interface ReminderTrigger {
  id: string;
  triggerType: 'before_due' | 'after_due' | 'after_issue';
  triggerValue: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface InvoiceNumberingConfig {
  prefix: string;
  startingNumber: number;
  includeYear: boolean;
  includeMonth: boolean;
  separator: string;
  digits: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  isDefault?: boolean;
}

export type Currency = string;

// Interface pour une facture complète
export interface Invoice {
  id: string;
  invoice_number: string;
  number?: string;
  client: string | { client_name: string };
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'draft' | 'overdue';
  paymentUrl?: string;
}

// Exporter toutes les interfaces nécessaires
