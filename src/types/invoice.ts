
export type BusinessType = 'company' | 'individual' | 'other' | 'lawyer' | 'freelancer';

export interface CompanyProfile {
  id?: string;
  name: string;
  address: string;
  email: string;
  emailType: 'personal' | 'professional' | 'company';
  phone: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxRate: string;
  termsAndConditions: string;
  thankYouMessage: string;
  defaultCurrency: string;
  businessType: BusinessType;
  businessTypeCustom?: string;
  paypal?: string;
  payoneer?: string;
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  triggers: ReminderTrigger[];
}

export interface ReminderTrigger {
  id: string;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_last_reminder';
  triggerValue: number;
  emailSubject: string;
  emailBody: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  position?: string; // Added position for compatibility
}

export interface InvoiceNumberingConfig {
  prefix: string;
  padding: number;
  suffix: string;
  resetAnnually: boolean;
  nextNumber: number;
}

export type PaymentMethod = 'card' | 'transfer' | 'check' | 'cash' | 'paypal' | 'payoneer' | 'other';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  enabled: boolean;
  details?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  days?: number;
  delay?: string; // Added for compatibility
  customDate?: string; // Added for compatibility
  termsText?: string; // Added for compatibility
  isDefault: boolean;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number | string; // Allow both number and string
  unitPrice: number | string; // Allow both number and string
  taxRate: number | string; // Allow both number and string
  tva?: string; // Added for compatibility
  discount?: number | string; // Allow both number and string
  total: number | string; // Allow both number and string
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  issueDate?: string; // Added for compatibility
  invoiceDate?: string; // Added for compatibility
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  clientPhone?: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  items: ServiceLine[];
  notes?: string;
  termsAndConditions?: string;
  thankYouMessage?: string;
  paymentMethods?: PaymentMethodDetails[];
  subTotal: number;
  taxTotal?: number; // Added for compatibility
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  total?: number; // Added for compatibility
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  currency: string;
  templateId?: string; // Added for compatibility
  paymentTermsId?: string; // Added for compatibility
  customPaymentTerms?: string; // Added for compatibility
  paymentDelay?: string; // Added for compatibility
  issuerInfo?: CompanyProfile; // Added for compatibility
}
