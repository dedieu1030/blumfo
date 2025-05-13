
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
}

export interface TaxPayload {
  id?: string;
  name: string;
  rate: number;
  isDefault?: boolean;
}
