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
export const getPaymentTermTemplates = (): PaymentTermTemplate[] => {
  const savedTemplates = localStorage.getItem('paymentTermTemplates');
  if (savedTemplates) {
    try {
      const parsed = JSON.parse(savedTemplates);
      return parsed.map((template: any) => ({
        id: template.id,
        name: template.name,
        termsText: template.terms_text || template.termsText,
        delay: template.delay,
        customDate: template.customDate,
        isDefault: template.is_default || template.isDefault || false,
        days_after_issue: template.days_after_issue,
        terms_text: template.terms_text || template.termsText,
        is_default: template.is_default || template.isDefault || false
      }));
    } catch (error) {
      console.error("Error parsing payment term templates:", error);
    }
  }
  
  // Templates par défaut
  const defaultTemplates: PaymentTermTemplate[] = [
    {
      id: "immediate",
      name: "Paiement immédiat",
      termsText: "Paiement à réception de facture",
      delay: "immediate",
      isDefault: false,
      days_after_issue: 0,
      terms_text: "Paiement à réception de facture",
      is_default: false
    },
    {
      id: "15days",
      name: "15 jours",
      termsText: "Paiement à 15 jours",
      delay: "15",
      isDefault: false,
      days_after_issue: 15,
      terms_text: "Paiement à 15 jours",
      is_default: false
    },
    {
      id: "30days",
      name: "30 jours",
      termsText: "Paiement à 30 jours",
      delay: "30",
      isDefault: true,
      days_after_issue: 30,
      terms_text: "Paiement à 30 jours",
      is_default: true
    }
  ];
  
  savePaymentTermTemplates(defaultTemplates);
  return defaultTemplates;
};

export const savePaymentTermTemplates = (templates: PaymentTermTemplate[]): void => {
  localStorage.setItem('paymentTermTemplates', JSON.stringify(templates));
};

// Fonctions de gestion des méthodes de paiement
export const getDefaultPaymentMethods = (): PaymentMethodDetails[] => {
  const savedMethods = localStorage.getItem('paymentMethods');
  if (savedMethods) {
    try {
      const parsed = JSON.parse(savedMethods);
      return parsed.map((method: any) => ({
        id: method.id,
        name: method.name,
        enabled: method.enabled,
        type: method.type || method.id // Use id as type if not specified
      }));
    } catch (error) {
      console.error("Error parsing payment methods:", error);
    }
  }
  
  // Méthodes de paiement par défaut
  const defaultMethods: PaymentMethodDetails[] = [
    {
      id: "bank_transfer",
      name: "Virement bancaire",
      enabled: true,
      type: "bank_transfer"
    },
    {
      id: "credit_card",
      name: "Carte de crédit",
      enabled: true,
      type: "credit_card"
    },
    {
      id: "paypal",
      name: "PayPal",
      enabled: false,
      type: "paypal"
    }
  ];
  
  saveDefaultPaymentMethods(defaultMethods);
  return defaultMethods;
};

export const saveDefaultPaymentMethods = (methods: PaymentMethodDetails[]): void => {
  localStorage.setItem('paymentMethods', JSON.stringify(methods));
};
