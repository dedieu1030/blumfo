
export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxRate: string;
  logo?: string;
  termsAndConditions: string;
  thankYouMessage: string;
  defaultCurrency: string;
  // Additional payment methods
  paypal?: string;
  payoneer?: string;
}

export type PaymentMethod = "card" | "transfer" | "paypal" | "check" | "cash" | "payoneer" | "other";

export interface PaymentMethodDetails {
  type: PaymentMethod;
  enabled: boolean;
  details?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string; // Adding due date separate from payment delay
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone?: string;
  issuerInfo: CompanyProfile;
  serviceLines: ServiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentDelay: string;
  paymentMethods: PaymentMethodDetails[];
  notes: string;
  signature?: string;
  templateId: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  tva: string;
  total: string;
}
