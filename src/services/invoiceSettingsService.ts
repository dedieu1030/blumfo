
import { PaymentTermTemplate } from "@/types/invoice";
import { PaymentMethodDetails } from "@/types/invoice";
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";
import { InvoiceNumberingConfig } from "@/types/invoice";
import { CurrencyInfo } from "@/types/invoice";

export const availableCurrencies: CurrencyInfo[] = [
  { code: "EUR", symbol: "€", name: "Euro", position: "suffix" },
  { code: "USD", symbol: "$", name: "Dollar US", position: "prefix" },
  { code: "GBP", symbol: "£", name: "Livre Sterling", position: "prefix" },
  { code: "CAD", symbol: "C$", name: "Dollar Canadien", position: "prefix" },
  { code: "AUD", symbol: "A$", name: "Dollar Australien", position: "prefix" },
  { code: "CHF", symbol: "Fr", name: "Franc Suisse", position: "suffix" },
  { code: "JPY", symbol: "¥", name: "Yen Japonais", position: "prefix" },
  { code: "CNY", symbol: "¥", name: "Yuan Chinois", position: "prefix" },
  { code: "SEK", symbol: "kr", name: "Couronne Suédoise", position: "suffix" },
  { code: "NOK", symbol: "kr", name: "Couronne Norvégienne", position: "suffix" },
  { code: "DKK", symbol: "kr", name: "Couronne Danoise", position: "suffix" }
];

// Get the default payment term
export const getDefaultPaymentTerm = (): string => {
  const term = localStorage.getItem('defaultPaymentTerm');
  return term || '15';
};

// Save default payment term
export const saveDefaultPaymentTerm = (term: string, customDate?: string): void => {
  localStorage.setItem('defaultPaymentTerm', term);
  if (customDate) {
    localStorage.setItem('defaultCustomPaymentDate', customDate);
  } else {
    localStorage.removeItem('defaultCustomPaymentDate');
  }
};

// Get custom payment date if applicable
export const getDefaultCustomPaymentDate = (): string | null => {
  return localStorage.getItem('defaultCustomPaymentDate');
};

// Get the default currency
export const getDefaultCurrency = (): string => {
  const currency = localStorage.getItem('defaultCurrency');
  return currency || 'EUR';
};

// Save default currency
export const saveDefaultCurrency = (currency: string): void => {
  localStorage.setItem('defaultCurrency', currency);
};

// Get currency info
export const getCurrencyInfo = (code: string): CurrencyInfo => {
  const currency = availableCurrencies.find(c => c.code === code);
  return currency || availableCurrencies[0]; // Default to EUR if not found
};

// Get payment term templates
export const getPaymentTermsTemplates = (): PaymentTermTemplate[] => {
  const templatesString = localStorage.getItem('paymentTermsTemplates');
  if (templatesString) {
    try {
      return JSON.parse(templatesString);
    } catch (e) {
      console.error("Erreur lors du parsing des modèles de conditions:", e);
      return [];
    }
  }
  
  // Default templates if none exist
  const defaultTemplates: PaymentTermTemplate[] = [
    {
      id: "immediate",
      name: "Paiement immédiat",
      delay: "immediate",
      termsText: "Paiement à réception de facture",
      isDefault: true
    },
    {
      id: "net15",
      name: "Net 15",
      delay: "15",
      termsText: "Paiement dans les 15 jours suivant la réception",
      isDefault: false
    },
    {
      id: "net30",
      name: "Net 30",
      delay: "30",
      termsText: "Paiement dans les 30 jours suivant la réception",
      isDefault: false
    }
  ];
  
  localStorage.setItem('paymentTermsTemplates', JSON.stringify(defaultTemplates));
  return defaultTemplates;
};

// Save a payment term template
export const savePaymentTermTemplate = (template: PaymentTermTemplate): void => {
  const templates = getPaymentTermsTemplates();
  
  // Check if template with this ID already exists
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    // Update existing template
    templates[index] = template;
  } else {
    // Add new template
    templates.push(template);
  }
  
  // If this template is set as default, unset default flag on other templates
  if (template.isDefault) {
    templates.forEach(t => {
      if (t.id !== template.id) {
        t.isDefault = false;
      }
    });
  }
  
  localStorage.setItem('paymentTermsTemplates', JSON.stringify(templates));
};

// Get reminder schedules
export const getReminderSchedules = async (): Promise<{success: boolean, schedules?: ReminderSchedule[], error?: string}> => {
  // For now, get from localStorage, but this would typically be a DB call
  const schedulesString = localStorage.getItem('reminderSchedules');
  
  if (!schedulesString) {
    // Create a default reminder schedule if none exists
    const defaultSchedule: ReminderSchedule = {
      id: Date.now().toString(),
      name: "Rappels standards",
      enabled: true,
      isDefault: true,
      triggers: [
        {
          id: "before-1",
          triggerType: "days_before_due",
          triggerValue: 3,
          emailSubject: "Rappel: Facture à échéance prochaine",
          emailBody: "Bonjour,\n\nCe message est un rappel amical que votre facture arrivera à échéance dans 3 jours.\n\nCordialement,\nVotre entreprise"
        },
        {
          id: "after-1",
          triggerType: "days_after_due",
          triggerValue: 1,
          emailSubject: "Facture échue",
          emailBody: "Bonjour,\n\nVotre facture est maintenant échue. Merci de procéder au règlement dès que possible.\n\nCordialement,\nVotre entreprise"
        },
        {
          id: "after-2",
          triggerType: "days_after_last_reminder",
          triggerValue: 7,
          emailSubject: "Relance: Facture impayée",
          emailBody: "Bonjour,\n\nVotre facture est toujours en attente de règlement. Merci de nous contacter si vous rencontrez des difficultés.\n\nCordialement,\nVotre entreprise"
        }
      ]
    };
    
    const schedules = [defaultSchedule];
    localStorage.setItem('reminderSchedules', JSON.stringify(schedules));
    
    return { success: true, schedules };
  }
  
  try {
    const schedules = JSON.parse(schedulesString);
    return { success: true, schedules };
  } catch (e) {
    console.error("Erreur lors du parsing des planifications de relance:", e);
    return { success: false, error: "Erreur lors de la récupération des planifications" };
  }
};

// Save reminder schedule
export const saveReminderSchedule = async (schedule: ReminderSchedule): Promise<{success: boolean, error?: string}> => {
  const { success, schedules, error } = await getReminderSchedules();
  
  if (!success || !schedules) {
    return { success: false, error: error || "Impossible de récupérer les planifications existantes" };
  }
  
  let updatedSchedules;
  const index = schedules.findIndex(s => s.id === schedule.id);
  
  if (index >= 0) {
    // Update existing schedule
    updatedSchedules = [...schedules];
    updatedSchedules[index] = schedule;
  } else {
    // Add new schedule
    updatedSchedules = [...schedules, schedule];
  }
  
  // If this schedule is set as default, unset default flag on other schedules
  if (schedule.isDefault) {
    updatedSchedules.forEach(s => {
      if (s.id !== schedule.id) {
        s.isDefault = false;
      }
    });
  }
  
  try {
    localStorage.setItem('reminderSchedules', JSON.stringify(updatedSchedules));
    return { success: true };
  } catch (e) {
    console.error("Erreur lors de la sauvegarde des planifications:", e);
    return { success: false, error: "Erreur lors de la sauvegarde de la planification" };
  }
};

// Invoice Numbering Configuration

export const getInvoiceNumberingConfig = (): InvoiceNumberingConfig => {
  const configString = localStorage.getItem('invoiceNumberingConfig');
  if (configString) {
    try {
      const parsedConfig = JSON.parse(configString);
      // Ensure all required properties are present
      return {
        prefix: parsedConfig.prefix || 'INV-',
        nextNumber: parsedConfig.nextNumber || 1,
        suffix: parsedConfig.suffix || '',
        padding: parsedConfig.padding || 3,
        resetAnnually: parsedConfig.resetAnnually || false
      };
    } catch (e) {
      console.error("Erreur lors du parsing de la configuration de numérotation:", e);
    }
  }
  
  // Default configuration
  const defaultConfig: InvoiceNumberingConfig = {
    prefix: 'INV-',
    nextNumber: 1,
    suffix: '',
    padding: 3,
    resetAnnually: false
  };
  
  return defaultConfig;
};

export const saveInvoiceNumberingConfig = (config: InvoiceNumberingConfig): void => {
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(config));
};

// Get default payment methods
export const getDefaultPaymentMethods = (): PaymentMethodDetails[] => {
  const methodsString = localStorage.getItem('defaultPaymentMethods');
  if (methodsString) {
    try {
      return JSON.parse(methodsString);
    } catch (e) {
      console.error("Erreur lors du parsing des méthodes de paiement:", e);
      return [];
    }
  }
  
  // Default methods if none exist
  const defaultMethods: PaymentMethodDetails[] = [
    { type: "card", enabled: true, details: "Visa, Mastercard, Amex" },
    { type: "transfer", enabled: true, details: "" },
    { type: "check", enabled: false, details: "" },
    { type: "cash", enabled: false, details: "" },
    { type: "paypal", enabled: false, details: "" },
    { type: "payoneer", enabled: false, details: "" }
  ];
  
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(defaultMethods));
  return defaultMethods;
};

export const saveDefaultPaymentMethods = (methods: PaymentMethodDetails[]): void => {
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
};
