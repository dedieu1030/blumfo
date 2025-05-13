
import { InvoiceNumberingConfig, PaymentMethodDetails, PaymentTermTemplate, Currency } from '@/types/invoice';

export const availableCurrencies: Currency[] = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "Dollar US" },
  { code: "GBP", symbol: "£", name: "Livre Sterling" },
  { code: "CAD", symbol: "C$", name: "Dollar Canadien" },
  { code: "AUD", symbol: "A$", name: "Dollar Australien" },
  { code: "CHF", symbol: "CHF", name: "Franc Suisse" },
  { code: "JPY", symbol: "¥", name: "Yen Japonais" },
  { code: "CNY", symbol: "¥", name: "Yuan Chinois" },
  { code: "SEK", symbol: "kr", name: "Couronne Suédoise" },
  { code: "NOK", symbol: "kr", name: "Couronne Norvégienne" },
  { code: "DKK", symbol: "kr", name: "Couronne Danoise" },
];

// Fonctions de gestion des paramètres de numérotation des factures
export const getInvoiceNumberingConfig = (): InvoiceNumberingConfig => {
  const savedConfig = localStorage.getItem('invoiceNumberingConfig');
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (error) {
      console.error("Error parsing invoice numbering config:", error);
    }
  }
  
  // Configuration par défaut
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

// Fonctions de gestion de la devise par défaut
export const getDefaultCurrency = (): string => {
  const savedCurrency = localStorage.getItem('defaultCurrency');
  return savedCurrency || "EUR";
};

export const saveDefaultCurrency = (currencyCode: string): void => {
  localStorage.setItem('defaultCurrency', currencyCode);
};

// Fonctions de gestion des délais de paiement
export const getDefaultPaymentTerm = (): string => {
  const savedTerm = localStorage.getItem('defaultPaymentTerm');
  return savedTerm || "30"; // 30 jours par défaut
};

export const saveDefaultPaymentTerm = (term: string, customDate?: string): void => {
  localStorage.setItem('defaultPaymentTerm', term);
  if (customDate && term === 'custom') {
    localStorage.setItem('defaultPaymentTermCustomDate', customDate);
  }
};

// Fonctions de gestion des modèles de conditions de paiement
export const getPaymentTermTemplates = async (): Promise<PaymentTermTemplate[]> => {
  const savedTemplates = localStorage.getItem('paymentTermTemplates');
  if (savedTemplates) {
    try {
      return JSON.parse(savedTemplates);
    } catch (error) {
      console.error("Error parsing payment term templates:", error);
    }
  }
  
  // Templates par défaut
  const defaultTemplates = [
    {
      id: "immediate",
      name: "Paiement immédiat",
      terms_text: "Paiement à réception de facture",
      days_after_issue: 0,
      delay: "immediate",
      is_default: false
    },
    {
      id: "15days",
      name: "15 jours",
      terms_text: "Paiement à 15 jours",
      days_after_issue: 15,
      delay: "15",
      is_default: false
    },
    {
      id: "30days",
      name: "30 jours",
      terms_text: "Paiement à 30 jours",
      days_after_issue: 30,
      delay: "30",
      is_default: true
    }
  ];
  
  savePaymentTermTemplates(defaultTemplates);
  return defaultTemplates;
};

export const savePaymentTermTemplates = async (templates: PaymentTermTemplate[]): Promise<void> => {
  localStorage.setItem('paymentTermTemplates', JSON.stringify(templates));
};

// Fonctions de gestion des méthodes de paiement
export const getDefaultPaymentMethods = async (): Promise<PaymentMethodDetails[]> => {
  const savedMethods = localStorage.getItem('paymentMethods');
  if (savedMethods) {
    try {
      return JSON.parse(savedMethods);
    } catch (error) {
      console.error("Error parsing payment methods:", error);
    }
  }
  
  // Méthodes de paiement par défaut
  const defaultMethods = [
    {
      id: "bank_transfer",
      name: "Virement bancaire",
      enabled: true
    },
    {
      id: "credit_card",
      name: "Carte de crédit",
      enabled: true
    },
    {
      id: "paypal",
      name: "PayPal",
      enabled: false
    }
  ];
  
  saveDefaultPaymentMethods(defaultMethods);
  return defaultMethods;
};

export const saveDefaultPaymentMethods = async (methods: PaymentMethodDetails[]): Promise<void> => {
  localStorage.setItem('paymentMethods', JSON.stringify(methods));
};
