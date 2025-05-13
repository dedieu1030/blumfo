
// Re-export types correctly
export type { TaxConfiguration, CustomTaxConfiguration } from './tax';

// Basic types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

// Invoice-related types
export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_rate?: number;
  discount_amount?: number;
  total: number;
  product_id?: string;
  service_id?: string;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  amount?: number;
  description?: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
  decimalPlaces: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
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
  resetPeriod: 'never' | 'monthly' | 'yearly' | 'quarterly';
  resetAnnually?: boolean;
  lastReset: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  daysAfterIssue: number;
  termsText: string;
  isDefault: boolean;
  customDate?: string;
  description?: string;
}

export interface SignatureData {
  type: 'draw' | 'type' | 'initials';
  dataUrl: string;
  name?: string;
  initials?: string;
  fontFamily?: string;
  timestamp: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  isDefault: boolean;
}

export interface PaymentMethodDetails {
  bankTransfer?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    iban?: string;
    swiftBic?: string;
    routingNumber?: string;
    sortCode?: string;
  };
  paypal?: {
    email: string;
  };
  stripe?: {
    connected: boolean;
    accountId?: string;
  };
  other?: {
    instructions: string;
  };
}

export interface ReminderTrigger {
  id: string;
  days: number;
  type: 'before' | 'after';
  event: 'due_date' | 'issue_date' | 'payment_date';
  enabled: boolean;
}

export interface ReminderSchedule {
  enabled: boolean;
  triggers: ReminderTrigger[];
  emailTemplate?: string;
  smsTemplate?: string;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyNumber?: string;
  vatNumber?: string;
  logo?: string;
  logoUrl?: string;
  taxRate?: number;
  taxRegion?: string;
  defaultPaymentTerms?: string;
  defaultTerms?: string;
  defaultCurrency?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    swiftBic?: string;
  };
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
  businessType?: string;
  industry?: string;
  employeeCount?: number;
  foundedYear?: number;
  taxConfiguration?: {
    type: 'region' | 'custom';
    rate: number;
    defaultTaxRate?: string;
    region?: string;
    country?: string;
    customTax?: CustomTaxConfiguration;
  };
  paymentMethods?: PaymentMethodDetails;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  number?: string;
  client: string | { client_name: string; [key: string]: any };
  client_name?: string;
  issue_date?: string;
  date?: string;
  due_date?: string;
  dueDate?: string;
  amount: string;
  total_amount?: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentUrl?: string;
  [key: string]: any;
}

export interface InvoiceData {
  id?: string;
  number: string;
  date: Date;
  dueDate: Date;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  company: CompanyProfile;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms: string;
  notes?: string;
  terms?: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  currencySymbol: string;
  signature?: SignatureData | null;
  [key: string]: any;
}
