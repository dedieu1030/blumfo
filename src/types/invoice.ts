export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  issueDate?: string;
  dueDate?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone?: string;
  issuerInfo?: CompanyProfile;
  serviceLines: ServiceLine[];
  items?: ServiceLine[]; // Alternative name used in some components
  subtotal: number;
  tax?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  totalAmount?: number;
  notes?: string;
  paymentDelay?: string;
  paymentMethods?: PaymentMethodDetails[];
  templateId?: string;
  paymentTermsId?: string;
  customPaymentTerms?: string;
  
  // Propriétés pour les réductions et textes personnalisés
  discount?: DiscountInfo;
  introText?: string;
  conclusionText?: string;
  footerText?: string;

  // Nouvelles propriétés pour les signatures
  signature?: SignatureData;
  signatureDate?: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalPrice: number;
  tva?: string; // TVA percentage
  total?: string; // Formatted total
  
  // Nouvelle propriété pour les réductions par ligne
  discount?: DiscountInfo;
}

// Nouvelle interface pour les informations de réduction
export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  amount?: number; // Montant calculé de la réduction
}

export interface CompanyProfile {
  id?: string;
  name: string;
  address: string;
  email: string;
  emailType: 'personal' | 'professional' | 'company';
  phone: string;
  taxRate: number;
  taxRegion?: string; // Format: "countryId:regionId"
  defaultCurrency: string;
  businessType?: 'company' | 'individual' | 'lawyer' | 'freelancer' | 'other';
  businessTypeCustom?: string;
  termsAndConditions: string;
  thankYouMessage?: string;
  bankName?: string;
  bankAccount?: string;
  accountHolder?: string;
  paypal?: string;
  payoneer?: string;
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  customDate?: string;
  termsText: string;
  isDefault: boolean;
}

export interface PaymentMethodDetails {
  type: string;
  enabled: boolean;
  details?: string | Record<string, any>; // Support both string and object details
}

// Payment method types
export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

// Reminder interfaces
export interface InvoiceReminder {
  id: string;
  invoiceId: string;
  reminderRuleId?: string;
  sentAt: string;
  status: string;
  emailSubject?: string;
  emailBody?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderRule {
  id: string;
  scheduleId?: string;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface ReminderTrigger extends ReminderRule {
  id: string;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  triggers: ReminderTrigger[];
}

// Stripe customer interfaces
export interface StripeCustomer {
  id: string;
  userId: string;
  clientId?: string;
  stripeCustomerId: string;
  email: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Interface Invoice mise à jour pour résoudre les problèmes de typage
export interface Invoice {
  id: string;
  number: string;
  invoice_number: string;
  client: string | { client_name: string; [key: string]: any };
  client_name?: string;  // For compatibility
  amount: string;
  date: string;
  dueDate: string;
  due_date?: string;    // For compatibility
  issue_date?: string;  // For compatibility
  total_amount?: number; // For compatibility
  status: "paid" | "pending" | "overdue" | "draft";
  paymentUrl?: string;
  stripeInvoiceId?: string;
}

export interface InvoiceNumberingConfig {
  prefix: string;
  suffix: string;
  startNumber: number;
  padding: number;
  separator: string;
  includeDate: boolean;
  dateFormat: string;
  // Additional properties needed in the code
  digits?: number;
  nextNumber?: number;
  pattern?: string;
  resetPeriod?: "never" | "yearly" | "monthly";
  lastReset?: string;
  resetAnnually?: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  position?: 'before' | 'after'; // Added for backward compatibility
}

export type Currency = 'USD' | 'EUR' | 'CAD' | 'GBP' | 'AUD' | 'JPY' | 'CHF';

// Interface SignatureData mise à jour avec le nom correct de propriété
export interface SignatureData {
  type: 'drawn' | 'initials';
  dataUrl?: string;  // Correction de dataURL à dataUrl
  initials?: string;
  name?: string;
  timestamp?: string;
}
