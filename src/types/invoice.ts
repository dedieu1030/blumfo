
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
  customDate?: string; // Champ pour la date personnalisée
}

export interface PaymentMethodDetails {
  type: 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';
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

// Interface Invoice améliorée
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

// Interface ServiceLine améliorée pour inclure les champs utilisés dans l'application
export interface ServiceLine {
  id: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxRate?: number;
  total?: number | string;
  totalPrice?: number;
  tva?: string; // Champ tva ajouté car utilisé dans l'application
  discount?: DiscountInfo; // Champ discount ajouté car utilisé dans l'application
}

// Interface DiscountInfo améliorée pour inclure les champs supplémentaires utilisés
export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  label?: string;
  appliedTo?: 'total' | 'subtotal';
  amount?: number; // Montant calculé de la réduction
  description?: string; // Description de la réduction
}

export interface SignatureData {
  type: 'drawn' | 'initials';
  dataUrl?: string;
  initials?: string;
  name?: string;
  timestamp?: string;
}

// Interface InvoiceData améliorée
export interface InvoiceData {
  id?: string;
  number?: string;
  invoiceNumber?: string; // Ajouté car utilisé dans plusieurs composants
  issueDate: Date | string;
  dueDate?: Date | string;
  invoiceDate?: string; // Ajouté car utilisé dans plusieurs composants
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientVatId?: string;
  clientPhone?: string;
  items: ServiceLine[];
  serviceLines?: ServiceLine[]; // Alias pour items, utilisé dans certains composants
  taxRate?: number;
  paymentTerms?: string;
  notes?: string;
  currency?: string;
  discount?: DiscountInfo;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  totalAmount?: number; // Alias pour total, utilisé dans certains composants
  status?: string;
  issuerInfo?: CompanyProfile;
  paymentMethods?: PaymentMethodDetails[];
  signatures?: SignatureData[];
  signature?: SignatureData; // Utilisé pour une signature unique
  signatureDate?: string; // Date de signature
  stripeInvoiceId?: string;
  paymentUrl?: string;
  templateId?: string; // ID du template de facture
  paymentTermsId?: string; // ID du template de conditions de paiement
  customPaymentTerms?: string; // Conditions de paiement personnalisées
  paymentDelay?: string; // Délai de paiement
  introText?: string; // Texte d'introduction
  conclusionText?: string; // Texte de conclusion
  footerText?: string; // Texte de pied de page
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Définissons PaymentMethod comme un type string pour être compatible avec le code existant
export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

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
  enabled?: boolean; // Ajout du champ enabled qui est utilisé dans l'application
}
