
export interface CustomTaxConfiguration {
  country: string;
  countryName: string;
  taxType: string;
  mainRate: number;
  additionalRates?: { name: string; rate: number }[];
}

export interface TaxConfiguration {
  defaultTaxRate: string;
  region?: string;
  country?: string;
  customTax?: CustomTaxConfiguration;
}

export const TAX_TYPES = [
  'VAT', 'GST', 'HST', 'QST', 'PST', 'TVA', 'IVA', 'BTW', 'MwSt', 'USt'
];
