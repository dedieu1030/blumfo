import { 
  PaymentTermTemplate, 
  PaymentMethodDetails, 
  ReminderSchedule,
  InvoiceNumberingConfig,
  CurrencyInfo
} from "@/types/invoice";
import { toast } from "sonner";

// Liste des devises disponibles
export const availableCurrencies: CurrencyInfo[] = [
  { code: "EUR", symbol: "€", name: "Euro", position: "suffix" },
  { code: "USD", symbol: "$", name: "Dollar américain", position: "prefix" },
  { code: "GBP", symbol: "£", name: "Livre sterling", position: "prefix" },
  { code: "CAD", symbol: "$", name: "Dollar canadien", position: "prefix" },
  { code: "AUD", symbol: "$", name: "Dollar australien", position: "prefix" },
  { code: "CHF", symbol: "CHF", name: "Franc suisse", position: "suffix" },
  { code: "JPY", symbol: "¥", name: "Yen japonais", position: "prefix" },
  { code: "CNY", symbol: "¥", name: "Yuan chinois", position: "prefix" },
  { code: "SEK", symbol: "kr", name: "Couronne suédoise", position: "suffix" },
  { code: "NOK", symbol: "kr", name: "Couronne norvégienne", position: "suffix" },
  { code: "DKK", symbol: "kr", name: "Couronne danoise", position: "suffix" },
  { code: "PLN", symbol: "zł", name: "Złoty polonais", position: "suffix" },
  { code: "CZK", symbol: "Kč", name: "Couronne tchèque", position: "suffix" },
  { code: "HUF", symbol: "Ft", name: "Forint hongrois", position: "suffix" },
  { code: "RON", symbol: "lei", name: "Leu roumain", position: "suffix" },
  { code: "BGN", symbol: "лв", name: "Lev bulgare", position: "suffix" },
  { code: "TRY", symbol: "₺", name: "Livre turque", position: "suffix" },
  { code: "RUB", symbol: "₽", name: "Rouble russe", position: "suffix" },
  { code: "ZAR", symbol: "R", name: "Rand sud-africain", position: "prefix" },
  { code: "INR", symbol: "₹", name: "Roupie indienne", position: "prefix" },
  { code: "BRL", symbol: "R$", name: "Real brésilien", position: "prefix" },
  { code: "MXN", symbol: "$", name: "Peso mexicain", position: "prefix" },
  { code: "ARS", symbol: "$", name: "Peso argentin", position: "prefix" },
  { code: "CLP", symbol: "$", name: "Peso chilien", position: "prefix" },
  { code: "PEN", symbol: "S/", name: "Sol péruvien", position: "prefix" },
  { code: "COP", symbol: "$", name: "Peso colombien", position: "prefix" }
];

// Récupérer les modèles de conditions de paiement
export function getPaymentTermTemplates(): PaymentTermTemplate[] {
  const savedTerms = localStorage.getItem('paymentTermsTemplates');
  if (!savedTerms) {
    const defaultTerms: PaymentTermTemplate[] = [
      {
        id: "immediate",
        name: "Paiement immédiat",
        delay: "immediate",
        termsText: "Paiement à réception de facture.",
        isDefault: true
      },
      {
        id: "15days",
        name: "15 jours",
        delay: "15",
        termsText: "Paiement à 15 jours. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance.",
        isDefault: false
      },
      {
        id: "30days",
        name: "30 jours",
        delay: "30",
        termsText: "Paiement à 30 jours. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance.",
        isDefault: false
      }
    ];
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(defaultTerms));
    return defaultTerms;
  }
  
  try {
    return JSON.parse(savedTerms);
  } catch (e) {
    console.error("Erreur lors du parsing des modèles de conditions", e);
    return [];
  }
}

// Sauvegarder les modèles de conditions de paiement
export function savePaymentTermTemplates(templates: PaymentTermTemplate[]): void {
  localStorage.setItem('paymentTermsTemplates', JSON.stringify(templates));
}

// Récupérer les méthodes de paiement par défaut
export function getDefaultPaymentMethods(): PaymentMethodDetails[] {
  const savedMethods = localStorage.getItem('defaultPaymentMethods');
  if (!savedMethods) {
    const defaultMethods: PaymentMethodDetails[] = [
      { type: "card", enabled: true },
      { type: "transfer", enabled: true }
    ];
    localStorage.setItem('defaultPaymentMethods', JSON.stringify(defaultMethods));
    return defaultMethods;
  }
  
  try {
    return JSON.parse(savedMethods);
  } catch (e) {
    console.error("Erreur lors du parsing des méthodes de paiement", e);
    return [];
  }
}

// Sauvegarder les méthodes de paiement par défaut
export function saveDefaultPaymentMethods(methods: PaymentMethodDetails[]): void {
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
  toast.success("Méthodes de paiement mises à jour");
}

// Récupérer les planifications de relance
export function getReminderSchedules(): ReminderSchedule[] {
  const savedSchedules = localStorage.getItem('reminderSchedules');
  if (!savedSchedules) {
    const defaultSchedule: ReminderSchedule = {
      id: "default",
      name: "Relances standard",
      enabled: false,
      isDefault: true,
      triggers: [
        {
          id: "trigger1",
          triggerType: "days_after_due",
          triggerValue: 3,
          emailSubject: "Rappel de facture impayée",
          emailBody: "Cher [NOM_CLIENT],\n\nNous vous rappelons que votre facture [NUM_FACTURE] d'un montant de [MONTANT] € est arrivée à échéance le [DATE_ECHEANCE] et n'a pas encore été réglée.\n\nNous vous invitons à procéder à son règlement dès que possible.\n\nCordialement,\n[VOTRE_NOM]"
        },
        {
          id: "trigger2",
          triggerType: "days_after_previous_reminder",
          triggerValue: 7,
          emailSubject: "Relance importante - Facture impayée",
          emailBody: "Cher [NOM_CLIENT],\n\nMalgré notre précédent rappel, nous n'avons toujours pas reçu le paiement de votre facture [NUM_FACTURE] d'un montant de [MONTANT] €.\n\nNous vous invitons à procéder à son règlement dans les plus brefs délais afin d'éviter des frais supplémentaires.\n\nCordialement,\n[VOTRE_NOM]"
        }
      ]
    };
    localStorage.setItem('reminderSchedules', JSON.stringify([defaultSchedule]));
    return [defaultSchedule];
  }
  
  try {
    return JSON.parse(savedSchedules);
  } catch (e) {
    console.error("Erreur lors du parsing des planifications de relance", e);
    return [];
  }
}

// Sauvegarder les planifications de relance
export function saveReminderSchedules(schedules: ReminderSchedule[]): void {
  localStorage.setItem('reminderSchedules', JSON.stringify(schedules));
}

// Récupérer la configuration de numérotation des factures
export function getInvoiceNumberingConfig(): InvoiceNumberingConfig {
  const savedConfig = localStorage.getItem('invoiceNumberingConfig');
  if (!savedConfig) {
    const defaultConfig: InvoiceNumberingConfig = {
      prefix: "INV-",
      nextNumber: 1,
      padding: 3, // Pour obtenir 001, 002, etc.
      resetAnnually: false
    };
    localStorage.setItem('invoiceNumberingConfig', JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  
  try {
    return JSON.parse(savedConfig);
  } catch (e) {
    console.error("Erreur lors du parsing de la configuration de numérotation", e);
    return {
      prefix: "INV-",
      nextNumber: 1,
      padding: 3,
      resetAnnually: false
    };
  }
}

// Sauvegarder la configuration de numérotation des factures
export function saveInvoiceNumberingConfig(config: InvoiceNumberingConfig): void {
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(config));
  toast.success("Configuration de numérotation mise à jour");
}

// Récupérer le délai de paiement par défaut
export function getDefaultPaymentTerm(): string {
  const savedTerm = localStorage.getItem('defaultPaymentTerm');
  return savedTerm || "15";
}

// Récupérer la date d'échéance personnalisée si elle existe
export function getDefaultCustomDueDate(): string | null {
  return localStorage.getItem('defaultCustomDueDate');
}

// Sauvegarder le délai de paiement par défaut
export function saveDefaultPaymentTerm(term: string, customDate?: string): void {
  localStorage.setItem('defaultPaymentTerm', term);
  
  if (term === 'custom' && customDate) {
    localStorage.setItem('defaultCustomDueDate', customDate);
  } else {
    localStorage.removeItem('defaultCustomDueDate');
  }
}

// Récupérer la devise par défaut
export function getDefaultCurrency(): string {
  return localStorage.getItem('defaultCurrency') || "EUR";
}

// Sauvegarder la devise par défaut
export function saveDefaultCurrency(currency: string): void {
  localStorage.setItem('defaultCurrency', currency);
}

// Générer un numéro de facture formaté selon la configuration
export function generateInvoiceNumber(config: InvoiceNumberingConfig): string {
  const { prefix, nextNumber, suffix, padding } = config;
  const paddedNumber = nextNumber.toString().padStart(padding, '0');
  return `${prefix}${paddedNumber}${suffix || ''}`;
}

// Incrémenter le prochain numéro de facture après utilisation
export function incrementInvoiceNumber(): void {
  const config = getInvoiceNumberingConfig();
  config.nextNumber += 1;
  saveInvoiceNumberingConfig(config);
}
