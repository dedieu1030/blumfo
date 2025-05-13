import { CurrencyInfo } from "@/types/invoice";
import { PaymentTermTemplate } from "@/types/invoice";

export function getCurrencyInfo(currencyCode: string = 'EUR'): CurrencyInfo {
  const currencyMap: Record<string, CurrencyInfo> = {
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      decimalPlaces: 2,
      symbolPosition: 'after', // Changé de 'suffix' à 'after' pour être conforme au type
      decimalSeparator: ',',
      thousandSeparator: ' '
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    CAD: {
      code: 'CAD',
      symbol: '$',
      name: 'Canadian Dollar',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    AUD: {
      code: 'AUD',
      symbol: '$',
      name: 'Australian Dollar',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    JPY: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      decimalPlaces: 0,
      symbolPosition: 'before',
      decimalSeparator: '',
      thousandSeparator: ','
    },
    CHF: {
      code: 'CHF',
      symbol: 'Fr',
      name: 'Swiss Franc',
      decimalPlaces: 2,
      symbolPosition: 'after',
      decimalSeparator: '.',
      thousandSeparator: '\''
    }
  };

  return currencyMap[currencyCode] || currencyMap.EUR;
}

export const availableCurrencies = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
];

export function getPaymentTermTemplates(): PaymentTermTemplate[] {
  const storedTemplates = localStorage.getItem('paymentTermTemplates');
  if (storedTemplates) {
    return JSON.parse(storedTemplates);
  }
  
  // Default templates
  const defaultTemplates: PaymentTermTemplate[] = [
    {
      id: "1",
      name: "Standard - 30 jours",
      delay: "30",
      termsText: "Paiement à 30 jours. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance.",
      isDefault: true
    },
    {
      id: "2",
      name: "Paiement immédiat",
      delay: "immediate",
      termsText: "Paiement exigible à réception de la facture.",
      isDefault: false
    }
  ];
  
  localStorage.setItem('paymentTermTemplates', JSON.stringify(defaultTemplates));
  return defaultTemplates;
}

export function savePaymentTermTemplates(templates: PaymentTermTemplate[]): void {
  localStorage.setItem('paymentTermTemplates', JSON.stringify(templates));
}

export function getDefaultPaymentMethods() {
  const storedMethods = localStorage.getItem('defaultPaymentMethods');
  if (storedMethods) {
    return JSON.parse(storedMethods);
  }
  
  // Default payment methods
  const defaultMethods = [
    { id: '1', name: 'Virement bancaire', isDefault: true },
    { id: '2', name: 'Carte bancaire', isDefault: false },
    { id: '3', name: 'PayPal', isDefault: false }
  ];
  
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(defaultMethods));
  return defaultMethods;
}

export function saveDefaultPaymentMethods(methods: any[]): void {
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
}

export function getInvoiceNumberingConfig() {
  const storedConfig = localStorage.getItem('invoiceNumberingConfig');
  if (storedConfig) {
    return JSON.parse(storedConfig);
  }
  
  // Default config
  const defaultConfig = {
    prefix: 'INV-',
    startNumber: 1000,
    useDateInPrefix: false,
    dateFormat: 'YYYYMM',
    separator: '-',
    resetNumbering: false,
    resetPeriod: 'yearly'
  };
  
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(defaultConfig));
  return defaultConfig;
}

export function saveInvoiceNumberingConfig(config: any): void {
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(config));
}

export function getDefaultCurrency() {
  const currency = localStorage.getItem('defaultCurrency');
  return currency || 'EUR';
}

export function saveDefaultCurrency(currency: string): void {
  localStorage.setItem('defaultCurrency', currency);
}

export function getDefaultPaymentTerm() {
  const term = localStorage.getItem('defaultPaymentTerm');
  if (term) {
    return JSON.parse(term);
  }
  
  const defaultTerm = getPaymentTermTemplates().find(t => t.isDefault) || getPaymentTermTemplates()[0];
  localStorage.setItem('defaultPaymentTerm', JSON.stringify(defaultTerm));
  return defaultTerm;
}

export function saveDefaultPaymentTerm(term: PaymentTermTemplate): void {
  localStorage.setItem('defaultPaymentTerm', JSON.stringify(term));
}
