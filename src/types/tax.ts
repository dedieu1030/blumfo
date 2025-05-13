
// Extending the existing tax.ts file with additional types needed

export interface TaxConfiguration {
  id: string;
  name: string;
  country: string;
  rate: number;
  type: string;
  customTax?: boolean; // Add customTax property
}

// Define the CustomTaxConfiguration type
export interface CustomTaxConfiguration {
  id: string;
  name: string;
  rate: number;
  type: string;
  country?: string;
  region?: string;
  isDefault?: boolean;
}

// Define TaxZone, TaxCountry, and TaxRegionData interfaces
export interface TaxRegionData {
  id: string;
  name: string;
  code: string;
  totalRate: number;
  // Various tax rate types used in different countries
  vatStandardRate?: number;
  vatReducedRates?: number[];
  vatSuperReducedRate?: number;
  vatParkingRate?: number;
  gstRate?: number;
  hstRate?: number;
  stateTaxRate?: number;
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
  name: string;
  countries: TaxCountry[];
}

// Define TAX_TYPES
export const TAX_TYPES = [
  { id: 'vat', name: 'VAT' },
  { id: 'gst', name: 'GST' },
  { id: 'sales', name: 'Sales Tax' },
  { id: 'none', name: 'No Tax' },
];
