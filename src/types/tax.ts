export interface CustomTaxConfiguration {
  name: string;
  rate: number;
  country?: string;
  countryName?: string;
  taxType?: string;
  mainRate?: number;
  additionalRates?: Array<{name: string, rate: number}>;
}

export interface TaxConfiguration {
  defaultTaxRate: string;
  region: string;
  country: string;
  customTax?: CustomTaxConfiguration;
}

export const TAX_TYPES = [
  { key: 'tva', label: 'TVA (Taxe sur la Valeur Ajoutée)' },
  { key: 'vat', label: 'VAT (Value Added Tax)' },
  { key: 'gst', label: 'GST (Goods and Services Tax)' },
  { key: 'hst', label: 'HST (Harmonized Sales Tax)' },
  { key: 'igst', label: 'IGST (Integrated Goods and Services Tax)' },
  { key: 'cgst', label: 'CGST (Central Goods and Services Tax)' },
  { key: 'sgst', label: 'SGST (State Goods and Services Tax)' },
  { key: 'pst', label: 'PST (Provincial Sales Tax)' },
  { key: 'qst', label: 'QST (Quebec Sales Tax)' },
  { key: 'jct', label: 'JCT (Japanese Consumption Tax)' },
  { key: 'sst', label: 'SST (Sales and Service Tax)' },
  { key: 'ust', label: 'USt (Umsatzsteuer)' },
  { key: 'itbis', label: 'ITBIS (Impuesto sobre Transferencias de Bienes Industrializados y Servicios)' },
  { key: 'iva', label: 'IVA (Impuesto al Valor Agregado)' },
  { key: 'custom', label: 'Type de taxe personnalisé' },
];

export interface TaxZone {
  id: string;
  name: string;
  countryCode: string;
  regions: TaxRegionData[];
}

export interface TaxCountry {
  code: string;
  name: string;
  taxName: string;
  defaultRate?: number;
  regions?: TaxRegionData[];
}

export interface TaxRegionData {
  code: string;
  name: string;
  taxRate: number;
  additionalTaxes?: Array<{name: string, rate: number}>;
}
