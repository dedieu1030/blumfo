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
  status: 'paid' | 'unpaid' | 'draft' | 'pending';
  total: number;  // Ajout de la propriété manquante
  totalAmount: number;
  items?: InvoiceItem[];
  paymentMethods?: PaymentMethodDetails[];
  issuerInfo?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
    bankName?: string;
    accountHolder?: string;
    bankAccount?: string;
    paypal?: string;
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
  issueDate?: string; // Ajout du champ manquant
  signature?: SignatureData;
  signatureDate?: string;
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
  taxConfiguration?: TaxConfiguration;
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tva?: string | number;
  discount?: DiscountInfo;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  totalPrice: number;
  tva?: string | number;
  discount?: DiscountInfo;
}

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
  type: 'draw' | 'type' | 'initials';
  dataUrl: string;
  name: string;
  initials?: string;
  timestamp: string;
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
  triggerType: 'before_due' | 'after_due' | 'after_issue' | 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject: string;
  emailBody: string;
  scheduleId?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  termsText: string;
  isDefault: boolean;
  daysAfterIssue?: number;
  customDate?: string;
  description?: string;
}

export interface InvoiceNumberingConfig {
  prefix: string;
  suffix: string;
  startNumber: number;
  padding: number;
  separator: string;
  includeDate: boolean;
  dateFormat: string;
  digits: number;
  nextNumber: number;
  pattern: string;
  resetPeriod: string;
  lastReset: string;
  resetAnnually: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
}

export type Currency = string;

export interface Invoice {
  id: string;
  invoice_number: string;
  number?: string;
  client: string | { client_name: string; [key: string]: any };
  client_name?: string;
  date: string;
  issue_date?: string;
  due_date?: string;
  dueDate?: string;
  amount: string;
  total_amount?: number;
  status: 'paid' | 'pending' | 'draft' | 'overdue';
  paymentUrl?: string;
}
