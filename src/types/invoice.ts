export type BusinessType = 'company' | 'individual' | 'other';

export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  emailType: 'personal' | 'professional' | 'company';
  phone: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxRate: string;
  termsAndConditions: string;
  thankYouMessage: string;
  defaultCurrency: string;
  businessType: BusinessType;
  businessTypeCustom?: string;
  paypal?: string;
  payoneer?: string;
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
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_last_reminder';
  triggerValue: number;
  emailSubject: string;
  emailBody: string;
}
