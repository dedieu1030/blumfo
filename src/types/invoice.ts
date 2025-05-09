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
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: ServiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  paymentTerms?: string;
  status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  templateId?: string;
  currency?: string;
  paymentMethods?: PaymentMethodDetails[];
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
}

// Currency types
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  position: 'before' | 'after';
}

export type Currency = string; // ISO currency code
