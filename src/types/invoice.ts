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
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  termsText: string;
  isDefault: boolean;
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
