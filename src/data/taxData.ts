
import { TaxRegion } from "@/types/tax";

// Données des régions fiscales
export const taxRegionsData: TaxRegion[] = [
  {
    id: "france",
    name: "France",
    countryCode: "FR",
    regions: [
      {
        id: "fr-standard",
        name: "Taux Standard",
        code: "FR-STD",
        taxType: "vat-standard",
        vatStandardRate: 20,
        totalRate: 20,
      },
      {
        id: "fr-intermediate",
        name: "Taux Intermédiaire",
        code: "FR-INT",
        taxType: "vat-reduced",
        vatReducedRates: [10],
        totalRate: 10,
      },
      {
        id: "fr-reduced",
        name: "Taux Réduit",
        code: "FR-RED",
        taxType: "vat-reduced",
        vatReducedRates: [5.5],
        totalRate: 5.5,
      },
      {
        id: "fr-super-reduced",
        name: "Taux Super Réduit",
        code: "FR-SRD",
        taxType: "vat-super-reduced",
        vatSuperReducedRate: 2.1,
        totalRate: 2.1,
      },
      {
        id: "fr-exempt",
        name: "Exonéré",
        code: "FR-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      }
    ]
  },
  {
    id: "germany",
    name: "Allemagne",
    countryCode: "DE",
    regions: [
      {
        id: "de-standard",
        name: "Taux Standard",
        code: "DE-STD",
        taxType: "vat-standard",
        vatStandardRate: 19,
        totalRate: 19,
      },
      {
        id: "de-reduced",
        name: "Taux Réduit",
        code: "DE-RED",
        taxType: "vat-reduced",
        vatReducedRates: [7],
        totalRate: 7,
      },
      {
        id: "de-exempt",
        name: "Exonéré",
        code: "DE-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      }
    ]
  },
  {
    id: "spain",
    name: "Espagne",
    countryCode: "ES",
    regions: [
      {
        id: "es-standard",
        name: "Taux Standard (IVA)",
        code: "ES-STD",
        taxType: "vat-standard",
        vatStandardRate: 21,
        totalRate: 21,
      },
      {
        id: "es-reduced",
        name: "Taux Réduit (IVA)",
        code: "ES-RED",
        taxType: "vat-reduced",
        vatReducedRates: [10],
        totalRate: 10,
      },
      {
        id: "es-super-reduced",
        name: "Taux Super Réduit (IVA)",
        code: "ES-SRD",
        taxType: "vat-super-reduced",
        vatSuperReducedRate: 4,
        totalRate: 4,
      },
      {
        id: "es-exempt",
        name: "Exonéré",
        code: "ES-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      },
      {
        id: "es-canary",
        name: "Îles Canaries (IGIC)",
        code: "ES-CAN",
        taxType: "vat-standard",
        vatStandardRate: 7,
        totalRate: 7,
        notes: "Impuesto General Indirecto Canario"
      }
    ]
  },
  {
    id: "italy",
    name: "Italie",
    countryCode: "IT",
    regions: [
      {
        id: "it-standard",
        name: "Taux Standard (IVA)",
        code: "IT-STD",
        taxType: "vat-standard",
        vatStandardRate: 22,
        totalRate: 22,
      },
      {
        id: "it-reduced-10",
        name: "Taux Réduit (IVA)",
        code: "IT-RED",
        taxType: "vat-reduced",
        vatReducedRates: [10],
        totalRate: 10,
      },
      {
        id: "it-reduced-5",
        name: "Taux Super Réduit (IVA)",
        code: "IT-SRD",
        taxType: "vat-reduced",
        vatReducedRates: [5],
        totalRate: 5,
      },
      {
        id: "it-super-reduced",
        name: "Taux Minimal (IVA)",
        code: "IT-MIN",
        taxType: "vat-super-reduced",
        vatSuperReducedRate: 4,
        totalRate: 4,
      },
      {
        id: "it-exempt",
        name: "Exonéré",
        code: "IT-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      }
    ]
  },
  {
    id: "belgium",
    name: "Belgique",
    countryCode: "BE",
    regions: [
      {
        id: "be-standard",
        name: "Taux Standard",
        code: "BE-STD",
        taxType: "vat-standard",
        vatStandardRate: 21,
        totalRate: 21,
      },
      {
        id: "be-reduced-12",
        name: "Taux Réduit (12%)",
        code: "BE-R12",
        taxType: "vat-reduced",
        vatReducedRates: [12],
        totalRate: 12,
      },
      {
        id: "be-reduced-6",
        name: "Taux Réduit (6%)",
        code: "BE-R06",
        taxType: "vat-reduced",
        vatReducedRates: [6],
        totalRate: 6,
      },
      {
        id: "be-exempt",
        name: "Exonéré",
        code: "BE-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      }
    ]
  },
  {
    id: "switzerland",
    name: "Suisse",
    countryCode: "CH",
    regions: [
      {
        id: "ch-standard",
        name: "Taux Normal",
        code: "CH-NOR",
        taxType: "vat-standard",
        vatStandardRate: 8.1,
        totalRate: 8.1,
      },
      {
        id: "ch-reduced",
        name: "Taux Réduit",
        code: "CH-RED",
        taxType: "vat-reduced",
        vatReducedRates: [2.6],
        totalRate: 2.6,
      },
      {
        id: "ch-special",
        name: "Taux Spécial (Hébergement)",
        code: "CH-SPE",
        taxType: "vat-parking",
        vatParkingRate: 3.8,
        totalRate: 3.8,
      },
      {
        id: "ch-exempt",
        name: "Exonéré",
        code: "CH-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      }
    ]
  },
  {
    id: "united-kingdom",
    name: "Royaume-Uni",
    countryCode: "GB",
    regions: [
      {
        id: "uk-standard",
        name: "Taux Standard",
        code: "GB-STD",
        taxType: "vat-standard",
        vatStandardRate: 20,
        totalRate: 20,
      },
      {
        id: "uk-reduced",
        name: "Taux Réduit",
        code: "GB-RED",
        taxType: "vat-reduced",
        vatReducedRates: [5],
        totalRate: 5,
      },
      {
        id: "uk-zero",
        name: "Taux Zéro",
        code: "GB-ZER",
        taxType: "vat-reduced",
        vatReducedRates: [0],
        totalRate: 0,
        notes: "Produits soumis à la TVA mais avec un taux à 0%"
      },
      {
        id: "uk-exempt",
        name: "Exonéré",
        code: "GB-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
        notes: "Produits exonérés de TVA"
      }
    ]
  },
  {
    id: "canada",
    name: "Canada",
    countryCode: "CA",
    regions: [
      {
        id: "ca-on",
        name: "Ontario (HST)",
        code: "CA-ON",
        taxType: "hst",
        hstRate: 13,
        totalRate: 13,
      },
      {
        id: "ca-qc",
        name: "Québec (GST + QST)",
        code: "CA-QC",
        taxType: "gst-qst",
        gstRate: 5,
        qstRate: 9.975,
        totalRate: 14.975,
      },
      {
        id: "ca-bc",
        name: "Colombie-Britannique (GST + PST)",
        code: "CA-BC",
        taxType: "gst-pst",
        gstRate: 5,
        pstRate: 7,
        totalRate: 12,
      },
      {
        id: "ca-ab",
        name: "Alberta (GST uniquement)",
        code: "CA-AB",
        taxType: "gst",
        gstRate: 5,
        totalRate: 5,
      },
      {
        id: "ca-ns",
        name: "Nouvelle-Écosse (HST)",
        code: "CA-NS",
        taxType: "hst",
        hstRate: 15,
        totalRate: 15,
      },
      {
        id: "ca-nb",
        name: "Nouveau-Brunswick (HST)",
        code: "CA-NB",
        taxType: "hst",
        hstRate: 15,
        totalRate: 15,
      },
      {
        id: "ca-mb",
        name: "Manitoba (GST + PST)",
        code: "CA-MB",
        taxType: "gst-pst",
        gstRate: 5,
        pstRate: 7,
        totalRate: 12,
      },
      {
        id: "ca-sk",
        name: "Saskatchewan (GST + PST)",
        code: "CA-SK",
        taxType: "gst-pst",
        gstRate: 5,
        pstRate: 6,
        totalRate: 11,
      }
    ]
  },
  {
    id: "united-states",
    name: "États-Unis",
    countryCode: "US",
    regions: [
      {
        id: "us-ca",
        name: "Californie",
        code: "US-CA",
        taxType: "sales-tax",
        stateTaxRate: 7.25,
        totalRate: 7.25,
      },
      {
        id: "us-ny",
        name: "New York",
        code: "US-NY",
        taxType: "sales-tax",
        stateTaxRate: 4,
        localTaxRate: 4.5,
        totalRate: 8.5,
      },
      {
        id: "us-tx",
        name: "Texas",
        code: "US-TX",
        taxType: "sales-tax",
        stateTaxRate: 6.25,
        localTaxRate: 2,
        totalRate: 8.25,
      },
      {
        id: "us-fl",
        name: "Floride",
        code: "US-FL",
        taxType: "sales-tax",
        stateTaxRate: 6,
        localTaxRate: 1,
        totalRate: 7,
      },
      {
        id: "us-wa",
        name: "Washington",
        code: "US-WA",
        taxType: "sales-tax",
        stateTaxRate: 6.5,
        localTaxRate: 3.1,
        totalRate: 9.6,
      },
      {
        id: "us-or",
        name: "Oregon",
        code: "US-OR",
        taxType: "no-tax",
        totalRate: 0,
        notes: "Pas de taxe de vente dans l'Oregon"
      },
      {
        id: "us-de",
        name: "Delaware",
        code: "US-DE",
        taxType: "no-tax",
        totalRate: 0,
        notes: "Pas de taxe de vente au Delaware"
      }
    ]
  },
  {
    id: "mexico",
    name: "Mexique",
    countryCode: "MX",
    regions: [
      {
        id: "mx-standard",
        name: "Taux Standard (IVA)",
        code: "MX-STD",
        taxType: "iva-standard",
        ivaRate: 16,
        totalRate: 16,
      },
      {
        id: "mx-border",
        name: "Taux Frontalier (IVA)",
        code: "MX-BOR",
        taxType: "iva-reduced",
        ivaRate: 8,
        totalRate: 8,
        notes: "Applicable dans les zones frontalières"
      },
      {
        id: "mx-zero",
        name: "Taux Zéro (IVA)",
        code: "MX-ZER",
        taxType: "iva-zero",
        ivaRate: 0,
        totalRate: 0,
      },
      {
        id: "mx-exempt",
        name: "Exonéré (IVA)",
        code: "MX-EXE",
        taxType: "iva-exempt",
        totalRate: 0,
      }
    ]
  }
];

// Configuration des taxes par défaut pour les profils clients
export const defaultTaxConfigs = {
  "france": {
    defaultTaxRate: 20,
    defaultRegion: "france:fr-standard",
    label: "TVA (France)"
  },
  "germany": {
    defaultTaxRate: 19,
    defaultRegion: "germany:de-standard",
    label: "MwSt. (Deutschland)"
  },
  "spain": {
    defaultTaxRate: 21,
    defaultRegion: "spain:es-standard",
    label: "IVA (España)"
  },
  "italy": {
    defaultTaxRate: 22,
    defaultRegion: "italy:it-standard",
    label: "IVA (Italia)"
  },
  "belgium": {
    defaultTaxRate: 21,
    defaultRegion: "belgium:be-standard",
    label: "BTW/TVA (België/Belgique)"
  },
  "switzerland": {
    defaultTaxRate: 8.1,
    defaultRegion: "switzerland:ch-standard",
    label: "MwSt./TVA/IVA (Schweiz/Suisse/Svizzera)"
  },
  "united-kingdom": {
    defaultTaxRate: 20,
    defaultRegion: "united-kingdom:uk-standard",
    label: "VAT (United Kingdom)"
  },
  "canada": {
    defaultTaxRate: 5,
    defaultRegion: "canada:ca-ab",
    label: "Sales Tax (Canada)"
  },
  "united-states": {
    defaultTaxRate: 0,
    defaultRegion: "united-states:us-or",
    label: "Sales Tax (US)"
  },
  "mexico": {
    defaultTaxRate: 16,
    defaultRegion: "mexico:mx-standard",
    label: "IVA (México)"
  }
};

// Fonction utilitaire pour obtenir le taux de TVA par région
export const getTaxRateByRegion = (regionKey: string): number => {
  if (!regionKey) return 20; // Taux par défaut
  
  const [countryId, regionId] = regionKey.split(":");
  const country = taxRegionsData.find(c => c.id === countryId);
  if (!country) return 20;
  
  const region = country.regions.find(r => r.id === regionId);
  return region ? region.totalRate : 20;
};

// Fonction pour obtenir les options de taxe par pays
export const getTaxOptionsForCountry = (countryId: string) => {
  const country = taxRegionsData.find(c => c.id === countryId);
  if (!country) return [];
  
  return country.regions.map(region => ({
    id: `${country.id}:${region.id}`,
    name: region.name,
    rate: region.totalRate,
    code: region.code
  }));
};

// Fonction pour obtenir le taux de TVA d'une région spécifique
export const getTaxRateForRegion = (countryId: string, regionId: string): number => {
  const country = taxRegionsData.find(c => c.id === countryId);
  if (!country) return 20;
  
  const region = country.regions.find(r => r.id === regionId);
  return region ? region.totalRate : 20;
};
