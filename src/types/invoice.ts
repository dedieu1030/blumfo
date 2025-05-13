
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
  // Propriétés ajoutées pour résoudre les erreurs
  total: number;
  totalAmount: number;
  items?: InvoiceItem[];
  paymentMethods?: PaymentMethodDetails[];
  issuerInfo?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
    // Ajout des propriétés bancaires nécessaires pour InvoicePreview
    bankName?: string;
    accountHolder?: string;
    bankAccount?: string;
    paypal?: string;
    // Autres propriétés du profil d'entreprise
    emailType?: string;
    businessType?: string;
    termsAndConditions?: string;
    thankYouMessage?: string;
    defaultCurrency?: string;
    taxRate?: number;
  };
  notes?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  issueDate?: string;
  signature?: SignatureData;
  signatureDate?: string;
  // Propriétés supplémentaires pour les réductions et textes personnalisés
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: DiscountInfo;
  introText?: string;
  conclusionText?: string;
  footerText?: string;
  paymentDelay?: string;
  customPaymentTerms?: string;
  paymentTermsId?: string;
  templateId?: string;
  serviceLines?: ServiceLine[];
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
  // Ajout des propriétés pour la TVA et les remises
  tva?: string | number;
  discount?: DiscountInfo;
}

// Types pour ServiceLine avec toutes les propriétés utilisées dans l'application
export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  totalPrice: number;
  // Propriétés additionnelles
  tva?: string | number;
  discount?: DiscountInfo;
}

// Types pour les méthodes de paiement
export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  enabled: boolean;
  details?: string;
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
  enabled?: boolean; // Ajout de cette propriété manquante
  user_id?: string;
}

export interface ReminderTrigger {
  id: string;
  triggerType: 'before_due' | 'after_due' | 'after_issue' | 'days_before_due';
  triggerValue: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  description?: string;
  daysAfterIssue: number;
  isDefault?: boolean;
  // Ajout des propriétés manquantes
  delay?: string;
  customDate?: string;
  termsText?: string;
}

export interface InvoiceNumberingConfig {
  prefix: string;
  startingNumber?: number;
  includeYear?: boolean;
  includeMonth?: boolean;
  separator?: string;
  digits?: number;
  // Propriétés supplémentaires
  suffix?: string;
  padding?: number;
  pattern?: string;
  resetPeriod?: string;
  startNumber?: number;
  lastReset?: string;
  resetAnnually?: boolean;
  nextNumber?: number;
  dateFormat?: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  isDefault?: boolean;
}

export type Currency = string;

// Interface complète pour les factures dans les listes
export interface Invoice {
  id: string;
  invoice_number: string;
  number?: string;
  client: string | { client_name: string };
  client_name?: string;  // Ajout pour compatibilité
  date: string;
  issue_date?: string;  // Ajout pour compatibilité
  due_date?: string;    // Ajout pour compatibilité
  dueDate?: string;     // Ajout pour compatibilité
  amount: string;
  total_amount?: number; // Ajout pour compatibilité
  status: 'paid' | 'pending' | 'draft' | 'overdue';
  paymentUrl?: string;
}
