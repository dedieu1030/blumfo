// Re-export types correctly with 'export type'
export type { Tax } from './tax';
export type { User } from './user';

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

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
  decimalPlaces: number;
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
}

export interface SignatureData {
  type: 'draw' | 'type' | 'initials';
  dataUrl: string;
  name?: string;
  initials?: string;
  fontFamily?: string;
  timestamp: string;
}
