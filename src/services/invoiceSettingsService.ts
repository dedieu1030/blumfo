import { PaymentTermTemplate, CurrencyInfo } from "@/types/invoice";

export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  const currencies: Record<string, CurrencyInfo> = {
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', symbolPosition: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound Sterling', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
    CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
    AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
    CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: "'", decimalPlaces: 2 },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', symbolPosition: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
    BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', symbolPosition: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
    RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', symbolPosition: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  };

  return currencies[currencyCode] || { code: currencyCode, symbol: currencyCode, name: currencyCode, decimalPlaces: 2 };
};

export const getDefaultPaymentTerms = (): PaymentTermTemplate[] => {
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
