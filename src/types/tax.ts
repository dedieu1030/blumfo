

export interface TaxConfiguration {
  defaultTaxRate: number | string;
  region?: string;
  country?: string;
  useCustomRates?: boolean;
  customRates?: Record<string, number>;
  customTax?: CustomTaxConfiguration; // Add this field
}

export type TaxRateType = 'standard' | 'reduced' | 'super_reduced' | 'zero' | 'exempt' | 'custom';

export interface TaxRate {
  id: string;
  rate: number;
  name: string;
  type: TaxRateType;
  country?: string;
  region?: string;
  active?: boolean;
}

// Add these missing type definitions
export interface CustomTaxConfiguration {
  country?: string;
  countryName?: string;
  taxType?: string;
  mainRate: number;
  additionalRates?: Array<{name: string; rate: number}>;
}

export interface TaxZone {
  id: string;
  name: string;
  countries: TaxCountry[];
}

export interface TaxCountry {
  code: string;
  name: string;
  standardRate: number;
  reducedRates?: {[key: string]: number};
}

export interface TaxRegionData {
  key: string;
  name: string;
  description?: string;
  rate: number;
}

export const TAX_TYPES = {
  STANDARD: 'standard',
  REDUCED: 'reduced',
  SUPER_REDUCED: 'super_reduced',
  ZERO: 'zero',
  EXEMPT: 'exempt',
  CUSTOM: 'custom'
};

