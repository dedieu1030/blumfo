
import { Currency } from "./invoice";

export type TaxType = 'vat' | 'gst' | 'pst' | 'hst' | 'qst' | 'sales' | 'other';

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  taxType: TaxType;
  taxCode?: string;
  description?: string;
  isCompound: boolean;
  displayOrder: number;
}

export interface TaxConfiguration {
  id: string;
  name: string;
  description?: string;
  countryCode: string;
  regionCode?: string;
  isDefault: boolean;
  taxRates: TaxRate[];
}

export interface AppliedTaxRate {
  taxRateId: string;
  name: string;
  rate: number;
  taxType: TaxType;
  amount: number;
  displayOrder: number;
  isCompound: boolean;
}

export interface TaxCalculationResult {
  taxRates: AppliedTaxRate[];
  totalTax: number;
}

// Méthodes de calcul des taxes
export const calculateTaxes = (
  amount: number,
  taxRates: TaxRate[]
): TaxCalculationResult => {
  if (!taxRates || taxRates.length === 0) {
    return { taxRates: [], totalTax: 0 };
  }

  // Trier les taux par ordre d'affichage
  const sortedRates = [...taxRates].sort((a, b) => a.displayOrder - b.displayOrder);
  
  let runningTotal = amount;
  let totalTax = 0;
  const appliedRates: AppliedTaxRate[] = [];

  for (const rate of sortedRates) {
    // Déterminer la base imposable (montant original ou montant cumulé)
    const taxableAmount = rate.isCompound ? runningTotal : amount;
    
    // Calculer le montant de la taxe
    const taxAmount = taxableAmount * (rate.rate / 100);
    
    // Ajouter aux totaux
    totalTax += taxAmount;
    if (rate.isCompound) {
      runningTotal += taxAmount;
    }
    
    // Enregistrer les détails de la taxe appliquée
    appliedRates.push({
      taxRateId: rate.id,
      name: rate.name,
      rate: rate.rate,
      taxType: rate.taxType,
      amount: taxAmount,
      displayOrder: rate.displayOrder,
      isCompound: rate.isCompound
    });
  }

  return {
    taxRates: appliedRates,
    totalTax: totalTax
  };
};

// Formater les informations de taxe pour l'affichage
export const formatTaxDisplay = (appliedTaxes: AppliedTaxRate[], currency: Currency = 'EUR'): string => {
  if (!appliedTaxes || appliedTaxes.length === 0) {
    return 'Aucune taxe';
  }

  // Formater pour chaque taxe
  return appliedTaxes
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(tax => `${tax.name} (${tax.rate}%): ${tax.amount.toFixed(2)} ${currency}`)
    .join('\n');
};

// Récupérer une description détaillée des taxes
export const getTaxSummary = (appliedTaxes: AppliedTaxRate[]): string => {
  if (!appliedTaxes || appliedTaxes.length === 0) {
    return 'Hors taxes';
  }

  if (appliedTaxes.length === 1) {
    const tax = appliedTaxes[0];
    return `${tax.name} ${tax.rate}%`;
  }

  // Pour plusieurs taxes, lister les taux
  return appliedTaxes
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(tax => `${tax.name} ${tax.rate}%`)
    .join(' + ');
};
