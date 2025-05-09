
import { PaymentTermTemplate, PaymentMethodDetails } from "@/types/invoice";
import { InvoiceNumberingConfig, CurrencyInfo } from "@/types/invoice";

// Update currency information with correct position types
export const getCurrencies = (): { [key: string]: CurrencyInfo } => {
  return {
    USD: { code: "USD", name: "US Dollar", symbol: "$", position: "before" },
    EUR: { code: "EUR", name: "Euro", symbol: "€", position: "after" },
    GBP: { code: "GBP", name: "British Pound", symbol: "£", position: "before" },
    CAD: { code: "CAD", name: "Canadian Dollar", symbol: "$", position: "before" },
    AUD: { code: "AUD", name: "Australian Dollar", symbol: "$", position: "before" },
    JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", position: "before" },
    CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", position: "before" },
    CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", position: "before" },
    INR: { code: "INR", name: "Indian Rupee", symbol: "₹", position: "before" },
    BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", position: "before" },
    MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", position: "before" }
  };
};

// Export currencies as an array for dropdown selections
export const availableCurrencies = Object.values(getCurrencies());

// Get and save invoice numbering configuration
export const getInvoiceNumberingConfig = (): InvoiceNumberingConfig => {
  const storedConfig = localStorage.getItem('invoiceNumberingConfig');
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig);
    } catch (e) {
      console.error('Error parsing invoice numbering config', e);
    }
  }
  
  return {
    prefix: "INV",
    suffix: "",
    digits: 3,
    separator: "-",
    nextNumber: 1,
    pattern: "PREFIX-YEAR-NUMBER",
    resetPeriod: "never",
    lastReset: "",
    padding: 3,
    resetAnnually: false
  };
};

export const saveInvoiceNumberingConfig = (config: InvoiceNumberingConfig): void => {
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(config));
};

// Default currency functions
export const getDefaultCurrency = (): string => {
  const currency = localStorage.getItem('defaultCurrency');
  return currency || 'EUR';
};

export const saveDefaultCurrency = (currency: string): void => {
  localStorage.setItem('defaultCurrency', currency);
};

// Payment terms functions
export const getDefaultPaymentTerm = (customDate?: string): string => {
  const term = localStorage.getItem('defaultPaymentTerm');
  const storedCustomDate = localStorage.getItem('defaultPaymentTermCustomDate');
  
  if (customDate && term === 'custom') {
    localStorage.setItem('defaultPaymentTermCustomDate', customDate);
  }
  
  return term || '30';
};

export const saveDefaultPaymentTerm = (term: string, customDate?: string): void => {
  localStorage.setItem('defaultPaymentTerm', term);
  
  if (customDate && term === 'custom') {
    localStorage.setItem('defaultPaymentTermCustomDate', customDate);
  }
};

// Payment terms templates
export const getPaymentTermTemplates = (): PaymentTermTemplate[] => {
  const templates = localStorage.getItem('paymentTermsTemplates');
  if (templates) {
    try {
      return JSON.parse(templates);
    } catch (e) {
      console.error('Error parsing payment term templates', e);
      return [];
    }
  }
  
  // Return default templates if none are stored
  const defaultTemplates: PaymentTermTemplate[] = [
    {
      id: '1',
      name: 'Standard - 30 jours',
      delay: '30',
      termsText: 'Paiement à 30 jours. Des pénalités de retard de 3 fois le taux d\'intérêt légal seront appliquées en cas de paiement après la date d\'échéance.',
      isDefault: true
    },
    {
      id: '2',
      name: 'Paiement immédiat',
      delay: 'immediate',
      termsText: 'Paiement exigible à réception de la facture.',
      isDefault: false
    }
  ];
  
  localStorage.setItem('paymentTermsTemplates', JSON.stringify(defaultTemplates));
  return defaultTemplates;
};

export const savePaymentTermTemplates = (templates: PaymentTermTemplate[]): void => {
  localStorage.setItem('paymentTermsTemplates', JSON.stringify(templates));
};

// Default payment methods
export const getDefaultPaymentMethods = (): PaymentMethodDetails[] => {
  const methods = localStorage.getItem('defaultPaymentMethods');
  if (methods) {
    try {
      return JSON.parse(methods);
    } catch (e) {
      console.error('Error parsing default payment methods', e);
      return [];
    }
  }
  
  // Return default methods if none are stored
  const defaultMethods: PaymentMethodDetails[] = [
    { type: 'card', enabled: true, details: '' },
    { type: 'transfer', enabled: true, details: '' }
  ];
  
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(defaultMethods));
  return defaultMethods;
};

export const saveDefaultPaymentMethods = (methods: PaymentMethodDetails[]): void => {
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
};
