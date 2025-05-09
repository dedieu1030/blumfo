
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
  days: number;
  isDefault: boolean;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  total: number;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  items: ServiceLine[];
  notes?: string;
  termsAndConditions?: string;
  thankYouMessage?: string;
  paymentMethods?: PaymentMethodDetails[];
  subTotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  currency: string;
}
