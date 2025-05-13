
export interface TaxZone {
  id: string;
  name: string;
  countries: TaxCountry[];
}

export interface TaxCountry {
  id: string;
  name: string;
  countryCode: string;
  regions: TaxRegionData[];
}

export interface TaxRegionData {
  id: string;
  name: string;
  code: string;
  taxType: string;
  standardRate: number; // This is the standard rate
  vatStandardRate?: number;
  vatReducedRates?: number[];
  vatSuperReducedRate?: number;
  totalRate: number;
}

export interface TaxConfiguration {
  type: 'region' | 'custom';
  regionKey?: string;  // Format: "zoneId:countryId:regionId"
  customConfig?: CustomTaxConfiguration;
  rate: number;
}

export interface CustomTaxConfiguration {
  name: string;
  rate: number;
  country: string;
  countryName: string;
  taxType: string;
  mainRate: number;
  additionalRates: {
    name: string;
    rate: number;
  }[];
}

export const TAX_TYPES = {
  VAT: "VAT",
  GST: "GST",
  PST: "PST",
  HST: "HST",
  QST: "QST",
  NONE: "NONE",
  OTHER: "OTHER"
};
