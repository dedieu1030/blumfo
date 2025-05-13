
export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  isDefault?: boolean;
}

export interface RegionalTaxRate {
  countryCode: string;
  country: string;
  rate: number;
  standardName: string;
  reducedRates?: { [key: string]: number };
}

export interface CustomTaxConfiguration {
  name: string;
  rate: number;
  country: string;
  countryName: string;
  taxType: string;
  mainRate: number;
  additionalRates: { name: string; rate: number; }[];
}

export interface TaxZone {
  id: string;
  name: string;
  countries: TaxCountry[];
}

export interface TaxCountry {
  id: string;
  name: string;
  code: string;
  countryCode: string;
  taxSystem?: string;
  regions: TaxRegionData[];
}

export interface TaxRegionData {
  id: string;
  name: string;
  code?: string;
  standardRate: number;
  reducedRates?: { name: string; rate: number }[];
  totalRate?: number;
  taxType?: string;
  vatStandardRate?: number;
  vatReducedRates?: number[];
  vatSuperReducedRate?: number;
  vatParkingRate?: number;
  gstRate?: number;
  pstRate?: number;
  qstRate?: number;
  hstRate?: number;
  stateTaxRate?: number;
  localTaxRate?: number;
  ivaRate?: number;
  notes?: string;
}

export interface TaxPayload {
  id?: string;
  name: string;
  rate: number;
  isDefault?: boolean;
}

// Add missing TAX_TYPES constant
export const TAX_TYPES = [
  { id: 'vat-standard', name: 'TVA Standard' },
  { id: 'vat-reduced', name: 'TVA Réduite' },
  { id: 'vat-super-reduced', name: 'TVA Super Réduite' },
  { id: 'vat-exempt', name: 'Exonéré de TVA' },
  { id: 'gst', name: 'GST (Canada)' },
  { id: 'hst', name: 'HST (Canada)' },
  { id: 'sales-tax', name: 'Sales Tax (US)' },
  { id: 'iva-standard', name: 'IVA Standard' }
];

export interface TaxConfiguration {
  defaultTaxRate: string;
  region: string;
  country: string;
  customTax?: CustomTaxConfiguration;
}
