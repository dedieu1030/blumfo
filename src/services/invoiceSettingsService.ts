
import { PaymentTermTemplate } from '@/types/invoice';

// Functions needed by Invoicing.tsx
export const getInvoiceNumberingConfig = async () => {
  // Mock implementation
  return {
    prefix: 'INV',
    nextNumber: 1001,
    format: '{prefix}{number}'
  };
};

export const saveInvoiceNumberingConfig = async (config: any) => {
  console.log('Saving invoice numbering config:', config);
  return config;
};

export const getDefaultCurrency = async () => {
  return 'EUR';
};

export const saveDefaultCurrency = async (currency: string) => {
  console.log('Saving default currency:', currency);
  return currency;
};

export const getDefaultPaymentTerm = async () => {
  return {
    id: '1',
    name: 'Net 30',
    terms_text: 'Payment due within 30 days',
    days_after_issue: 30,
    delay: '30',
    is_default: true,
  };
};

export const saveDefaultPaymentTerm = async (termId: string) => {
  console.log('Saving default payment term:', termId);
  return termId;
};

export const availableCurrencies = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

// Functions needed by PaymentTermsSettings.tsx
export const getPaymentTermTemplates = async () => {
  return [
    {
      id: '1',
      name: 'Net 30',
      terms_text: 'Payment due within 30 days',
      days_after_issue: 30,
      delay: '30',
      is_default: true,
    },
    {
      id: '2',
      name: 'Net 15',
      terms_text: 'Payment due within 15 days',
      days_after_issue: 15,
      delay: '15',
      is_default: false,
    },
    {
      id: '3',
      name: 'Net 45',
      terms_text: 'Payment due within 45 days',
      days_after_issue: 45,
      delay: '45',
      is_default: false,
    }
  ];
};

export const savePaymentTermTemplates = async (templates: PaymentTermTemplate[]) => {
  console.log('Saving payment term templates:', templates);
  return templates;
};

// Functions needed by PaymentSettings.tsx
export const getDefaultPaymentMethods = async () => {
  return [
    { id: 'card', name: 'Card Payment', enabled: true },
    { id: 'bank', name: 'Bank Transfer', enabled: true },
    { id: 'paypal', name: 'PayPal', enabled: false }
  ];
};

export const saveDefaultPaymentMethods = async (methods: any[]) => {
  console.log('Saving default payment methods:', methods);
  return methods;
};
