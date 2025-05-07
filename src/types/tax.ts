
export interface TaxRegion {
  id: string;
  name: string;
  countryCode: string;
  regions: TaxRegionData[];
}

export interface TaxRegionData {
  id: string;
  name: string;
  code: string;
  taxType: "gst" | "gst-pst" | "gst-qst" | "hst";
  gstRate?: number;
  pstRate?: number;
  qstRate?: number;
  hstRate?: number;
  totalRate: number;
  notes?: string;
}

// Structure pour stocker la configuration fiscale dans le profil de l'entreprise
export interface TaxConfiguration {
  country: string;
  region?: string;
  defaultTaxRate: string;
}
