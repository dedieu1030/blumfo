
export interface CompanyProfile {
  id?: string;
  name: string;
  address: string;
  email: string;
  emailType: 'personal' | 'professional' | 'company';
  phone: string;
  bankAccount: string;
  bankName?: string;
  accountHolder?: string;
  taxRate: number;
  taxRegion?: string;  // ID de la région fiscale (pays)
  taxRegionCode?: string;  // Code de la juridiction fiscale spécifique
  termsAndConditions?: string;
  thankYouMessage?: string;
  defaultCurrency?: string;
  paypal?: string;
  payoneer?: string;
  businessType?: string;
  businessTypeCustom?: string;
  profileType?: string;
  profileSubtype?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  termsText: string;
  isDefault: boolean;
  customDate?: string; // Ajout du champ customDate manquant
}

export interface PaymentMethodDetails {
  type: 'card' | 'transfer';
  enabled: boolean;
  details: string;
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
  resetPeriod: "never" | "monthly" | "annually";
  lastReset: string;
  resetAnnually: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
}

// Nouvelles interfaces pour les types manquants
export interface Invoice {
  id: string;
  number: string;
  invoice_number: string;
  client: string | { client_name: string, [key: string]: any };
  client_name?: string;
  amount: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
  paymentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  currency?: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  total?: number;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  label?: string;
  appliedTo?: 'total' | 'subtotal';
}

export interface SignatureData {
  type: 'drawn' | 'initials';
  dataUrl?: string;
  initials?: string;
  name?: string;
  timestamp?: string;
}

export interface InvoiceData {
  id?: string;
  number?: string;
  issueDate: Date | string;
  dueDate?: Date | string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientVatId?: string;
  items: ServiceLine[];
  taxRate?: number;
  paymentTerms?: string;
  notes?: string;
  currency?: string;
  discount?: DiscountInfo;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  status?: string;
  issuerInfo?: CompanyProfile;
  paymentMethods?: PaymentMethodDetails[];
  signatures?: SignatureData[];
  stripeInvoiceId?: string;
  paymentUrl?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  details: string;
}

export interface ReminderTrigger {
  id: string;
  days: number;
  emailTemplate: string;
  active: boolean;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  triggers: ReminderTrigger[];
  isDefault: boolean;
}
