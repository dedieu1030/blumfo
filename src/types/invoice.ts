
export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  emailType: "personal" | "professional" | "company"; // Type modifié pour être obligatoire avec des options spécifiques
  phone: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxRate: string;
  logo?: string;
  termsAndConditions: string;
  thankYouMessage: string;
  defaultCurrency: string;
  // Type d'activité professionnelle
  businessType?: "company" | "individual" | "lawyer" | "freelancer" | "other";
  businessTypeCustom?: string; // Pour "other"
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

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string; // "immediate", "7", "15", "30", "60", "custom"
  customDate?: string; // for custom date if delay is "custom"
  termsText: string;
  isDefault: boolean; // Changed from optional to required with a default value
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
  paymentTermsId?: string; // Reference to a payment term template
  customPaymentTerms?: string; // Custom terms for this invoice
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  tva: string;
  total: string;
}
