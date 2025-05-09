

export interface ReminderTrigger {
  id: string;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject: string;
  emailBody: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  triggers: ReminderTrigger[];
}

// Invoice types
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  invoiceDate?: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  issuerInfo?: CompanyProfile;
  items: ServiceLine[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  taxTotal?: number;
  totalAmount: number;
  total?: number;
  notes?: string;
  paymentTerms?: string;
  status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  templateId?: string;
  currency?: string;
  paymentMethods?: PaymentMethodDetails[];
  paymentDelay?: string;
  customPaymentTerms?: string;
  paymentTermsId?: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalPrice: number;
  tva?: string;
  total?: string;
}

// Company Profile types
export interface CompanyProfile {
  id?: string;
  name: string;
  accountHolder?: string;
  email: string;
  phone?: string;
  address: string;
  logo?: string;
  website?: string;
  taxId?: string;
  vatNumber?: string;
  businessType?: string;
  businessTypeCustom?: string;
  bankName?: string;
  bankAccount?: string;
  iban?: string;
  swift?: string;
  taxRate: number;
  defaultCurrency: string;
  termsAndConditions?: string;
  thankYouMessage?: string;
  paypal?: string;
  payoneer?: string;
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
  emailType?: 'personal' | 'professional' | 'company';
}

// Payment method types
export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  enabled: boolean;
  details?: string;
}

// Payment terms types
export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  termsText: string;
  isDefault: boolean;
  customDate?: string;
}

// Invoice numbering configuration
export interface InvoiceNumberingConfig {
  prefix: string;
  suffix: string;
  pattern: string;
  digits: number;
  separator: string;
  nextNumber: number;
  resetPeriod: 'never' | 'yearly' | 'monthly';
  lastReset?: string;
  padding?: number;
  resetAnnually?: boolean;
}

// Currency types
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  position: 'before' | 'after';
}

export type Currency = string; // ISO currency code

// Invoice interface used in InvoiceList component
export interface Invoice {
  id: string;
  number: string;
  invoice_number: string;
  client: string;
  amount: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  paymentUrl?: string;
  stripeInvoiceId?: string;
}
