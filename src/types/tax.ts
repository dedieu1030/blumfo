
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

export interface TaxRegionData {
  id: string;
  name: string;
  code: string;
  taxType: string;
  totalRate: number;
  vatStandardRate?: number;
  vatReducedRates?: number[];
  vatSuperReducedRate?: number;
  vatParkingRate?: number;
  gstRate?: number;
  pstRate?: number;
  hstRate?: number;
  qstRate?: number;
  stateTaxRate?: number;
  localTaxRate?: number;
  ivaRate?: number;
  notes?: string;
}

export interface TaxCountry {
  id: string;
  name: string;
  countryCode: string;
  regions: TaxRegionData[];
}

export interface TaxZone {
  id: string;
  name: string;
  countries: TaxCountry[];
}

export const TAX_TYPES = [
  'VAT', 'GST', 'HST', 'QST', 'PST', 'TVA', 'IVA', 'BTW', 'MwSt', 'USt'
];
