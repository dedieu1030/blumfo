
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
  taxType: "gst" | "gst-pst" | "gst-qst" | "hst" | "sales-tax" | "no-tax" | 
           "iva-standard" | "iva-reduced" | "iva-zero" | "iva-exempt" | "iva-special" |
           "vat-standard" | "vat-reduced" | "vat-super-reduced" | "vat-parking" | "vat-exempt";
  gstRate?: number;
  pstRate?: number;
  qstRate?: number;
  hstRate?: number;
  stateTaxRate?: number;  // Pour les taxes d'État américaines
  localTaxRate?: number;  // Pour les taxes locales américaines
  ivaRate?: number;       // Pour l'IVA mexicaine
  vatStandardRate?: number;        // Pour la TVA standard européenne
  vatReducedRates?: number[];      // Pour les taux réduits européens
  vatSuperReducedRate?: number;    // Pour le taux super-réduit européen
  vatParkingRate?: number;         // Pour le taux parking européen
  totalRate: number;               // Le taux principal utilisé par défaut
  notes?: string;
}

// Structure pour stocker la configuration fiscale dans le profil de l'entreprise
export interface TaxConfiguration {
  country: string;
  region?: string;
  defaultTaxRate: string;
}
