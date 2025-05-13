
import { PaymentTermTemplate, CurrencyInfo, InvoiceNumberingConfig } from "@/types/invoice";

// Define available currencies
export const availableCurrencies = [
  { code: 'EUR', symbol: '€', name: 'Euro', symbolPosition: 'after' as const, decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  { code: 'USD', symbol: '$', name: 'US Dollar', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: "'", decimalPlaces: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', symbolPosition: 'before' as const, decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', symbolPosition: 'before' as const, decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', symbolPosition: 'after' as const, decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
];

export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  const currency = availableCurrencies.find(c => c.code === currencyCode);
  
  if (currency) {
    return currency;
  }
  
  // Default fallback
  return { 
    code: currencyCode, 
    symbol: currencyCode, 
    name: currencyCode, 
    symbolPosition: 'before', 
    decimalSeparator: '.',
    thousandSeparator: ',',
    decimalPlaces: 2 
  };
};

// Invoice Numbering Configuration
export const getInvoiceNumberingConfig = (): InvoiceNumberingConfig => {
  const savedConfig = localStorage.getItem('invoiceNumberingConfig');
  
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (e) {
      console.error("Error parsing invoice numbering config", e);
    }
  }
  
  // Default configuration if none is found
  return {
    prefix: "INV",
    suffix: "",
    startNumber: 1,
    padding: 3,
    separator: "-",
    includeDate: true,
    dateFormat: "YYYY-MM-DD",
    digits: 3,
    nextNumber: 1,
    pattern: "PREFIX-YEAR-NUMBER",
    resetPeriod: "never",
    lastReset: "",
    resetAnnually: false
  };
};

export const saveInvoiceNumberingConfig = (config: InvoiceNumberingConfig): void => {
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(config));
};

// Currency settings
export const getDefaultCurrency = (): string => {
  return localStorage.getItem('defaultCurrency') || 'EUR';
};

export const saveDefaultCurrency = (currencyCode: string): void => {
  localStorage.setItem('defaultCurrency', currencyCode);
};

// Payment terms
export const getDefaultPaymentTerms = (): PaymentTermTemplate[] => {
  const savedTerms = localStorage.getItem('paymentTerms');
  if (savedTerms) {
    try {
      return JSON.parse(savedTerms);
    } catch (e) {
      console.error("Error parsing payment terms", e);
    }
  }
  
  // Default payment terms if none are found
  return [
    {
      id: "immediate",
      name: "Paiement immédiat",
      delay: "0",
      daysAfterIssue: 0,
      termsText: "Paiement dû à réception de la facture.",
      isDefault: true
    },
    {
      id: "15days",
      name: "15 jours",
      delay: "15",
      daysAfterIssue: 15, 
      termsText: "Paiement dû dans les 15 jours suivant la réception de la facture.",
      isDefault: false
    },
    {
      id: "30days",
      name: "30 jours",
      delay: "30",
      daysAfterIssue: 30,
      termsText: "Paiement dû dans les 30 jours suivant la réception de la facture.",
      isDefault: false
    },
    {
      id: "60days",
      name: "60 jours",
      delay: "60",
      daysAfterIssue: 60,
      termsText: "Paiement dû dans les 60 jours suivant la réception de la facture.",
      isDefault: false
    }
  ];
};

// Payment term functions
export const getDefaultPaymentTerm = (): string => {
  return localStorage.getItem('defaultPaymentTerm') || 'immediate';
};

export const saveDefaultPaymentTerm = (termId: string, customDate?: string): void => {
  localStorage.setItem('defaultPaymentTerm', termId);
  if (customDate && termId === 'custom') {
    localStorage.setItem('defaultPaymentTermCustomDate', customDate);
  }
};

// Payment methods
export const getDefaultPaymentMethods = (): string[] => {
  const savedMethods = localStorage.getItem('paymentMethods');
  if (savedMethods) {
    try {
      return JSON.parse(savedMethods);
    } catch (e) {
      console.error("Error parsing payment methods", e);
      return ['bank_transfer'];
    }
  }
  return ['bank_transfer'];
};

export const saveDefaultPaymentMethods = (methods: string[]): void => {
  localStorage.setItem('paymentMethods', JSON.stringify(methods));
};
