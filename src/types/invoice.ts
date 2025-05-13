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
  status: 'paid' | 'unpaid' | 'draft';
}

export interface CustomTaxConfiguration {
  name: string;
  rate: number;
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
  // Configuration fiscale
  taxConfiguration?: {
    defaultTaxRate: string;
    region: string;
    country: string;
    customTax?: CustomTaxConfiguration;
  };
  // Propriétés pour ProfileWizard et ProfileViewer
  profileType?: 'personal' | 'business';
  profileSubtype?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
