
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issuerInfo?: CompanyProfile;
  serviceLines: ServiceLine[];
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
  paymentDelay?: string;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalPrice: number;
}

export interface CompanyProfile {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  tpsNumber?: string;
  tvqNumber?: string;
  businessType?: string;
  businessTypeCustom?: string;
  emailType?: string;
  logoUrl?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  delay: string;
  customDate?: string;
  termsText: string;
  isDefault: boolean;
}

export interface PaymentMethodDetails {
  type: string;
  enabled: boolean;
  details?: Record<string, any>;
}

// Nouvelles interfaces pour les relances
export interface InvoiceReminder {
  id: string;
  invoiceId: string;
  reminderRuleId?: string;
  sentAt: string;
  status: string;
  emailSubject?: string;
  emailBody?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderRule {
  id: string;
  scheduleId?: string;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface ReminderTrigger extends ReminderRule {
  id: string;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  triggers: ReminderTrigger[];
}

// Interfaces pour les clients Stripe
export interface StripeCustomer {
  id: string;
  userId: string;
  clientId?: string;
  stripeCustomerId: string;
  email: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
