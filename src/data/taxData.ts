
import { TaxRegion } from "@/types/tax";

// Données des régions fiscales
export const taxRegionsData: TaxRegion[] = [
  {
    id: "european-union",
    name: "Union Européenne",
    countryCode: "EU",
    regions: [
      {
        id: "fr-standard",
        name: "France - Standard",
        code: "FR-STD",
        taxType: "vat-standard",
        vatStandardRate: 20,
        totalRate: 20,
      },
      {
        id: "fr-intermediate",
        name: "France - Intermédiaire",
        code: "FR-INT",
        taxType: "vat-reduced",
        vatReducedRates: [10],
        totalRate: 10,
      },
      {
        id: "fr-reduced",
        name: "France - Réduit",
        code: "FR-RED",
        taxType: "vat-reduced",
        vatReducedRates: [5.5],
        totalRate: 5.5,
      },
      {
        id: "fr-super-reduced",
        name: "France - Super Réduit",
        code: "FR-SRD",
        taxType: "vat-super-reduced",
        vatSuperReducedRate: 2.1,
        totalRate: 2.1,
      },
      {
        id: "fr-exempt",
        name: "France - Exonéré",
        code: "FR-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      },
      {
        id: "de-standard",
        name: "Allemagne - Standard",
        code: "DE-STD",
        taxType: "vat-standard",
        vatStandardRate: 19,
        totalRate: 19,
      },
      {
        id: "de-reduced",
        name: "Allemagne - Réduit",
        code: "DE-RED",
        taxType: "vat-reduced",
        vatReducedRates: [7],
        totalRate: 7,
      },
      {
        id: "de-exempt",
        name: "Allemagne - Exonéré",
        code: "DE-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      },
      {
        id: "es-standard",
        name: "Espagne - Standard",
        code: "ES-STD",
        taxType: "vat-standard",
        vatStandardRate: 21,
        totalRate: 21,
      },
      {
        id: "es-reduced",
        name: "Espagne - Réduit",
        code: "ES-RED",
        taxType: "vat-reduced",
        vatReducedRates: [10],
        totalRate: 10,
      },
      {
        id: "es-super-reduced",
        name: "Espagne - Super Réduit",
        code: "ES-SRD",
        taxType: "vat-super-reduced",
        vatSuperReducedRate: 4,
        totalRate: 4,
      },
      {
        id: "es-exempt",
        name: "Espagne - Exonéré",
        code: "ES-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      },
      {
        id: "es-canary",
        name: "Espagne - Îles Canaries",
        code: "ES-CAN",
        taxType: "vat-standard",
        vatStandardRate: 7,
        totalRate: 7,
      },
      {
        id: "it-standard",
        name: "Italie - Standard",
        code: "IT-STD",
        taxType: "vat-standard",
        vatStandardRate: 22,
        totalRate: 22,
      },
      {
        id: "it-reduced-10",
        name: "Italie - Réduit",
        code: "IT-RED",
        taxType: "vat-reduced",
        vatReducedRates: [10],
        totalRate: 10,
      },
      {
        id: "it-reduced-5",
        name: "Italie - Super Réduit",
        code: "IT-SRD",
        taxType: "vat-reduced",
        vatReducedRates: [5],
        totalRate: 5,
      },
      {
        id: "it-super-reduced",
        name: "Italie - Minimal",
        code: "IT-MIN",
        taxType: "vat-super-reduced",
        vatSuperReducedRate: 4,
        totalRate: 4,
      },
      {
        id: "it-exempt",
        name: "Italie - Exonéré",
        code: "IT-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      },
      {
        id: "be-standard",
        name: "Belgique - Standard",
        code: "BE-STD",
        taxType: "vat-standard",
        vatStandardRate: 21,
        totalRate: 21,
      },
      {
        id: "be-reduced-12",
        name: "Belgique - Réduit (12%)",
        code: "BE-R12",
        taxType: "vat-reduced",
        vatReducedRates: [12],
        totalRate: 12,
      },
      {
        id: "be-reduced-6",
        name: "Belgique - Réduit (6%)",
        code: "BE-R06",
        taxType: "vat-reduced",
        vatReducedRates: [6],
        totalRate: 6,
      },
      {
        id: "be-exempt",
        name: "Belgique - Exonéré",
        code: "BE-EXE",
        taxType: "vat-exempt",
        totalRate: 0,
      },
      {
        id: "uk-standard",
        name: "Royaume-Uni - Standard",
        code: "GB-STD",
        taxType: "vat-standard",
        vatStandardRate: 20,
        totalRate: 20,
      },
      {
        id: "uk-reduced",
        name: "Royaume-Uni - Réduit",
        code: "GB-RED",
        taxType: "vat-reduced",
        vatReducedRates: [5],
        totalRate: 5,
      },
      {
        id: "uk-zero",
        name: "Royaume-Uni - Zéro",
        code: "GB-ZER",
        taxType: "vat-reduced",
        vatReducedRates: [0],
        totalRate: 0,
      },
      {
        id: "uk-exempt",
        name: "Royaume-Uni - Exonéré",
        code: "GB-EXE",
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
        name: "Taux Hébergement",
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
        name: "Colombie-Britannique",
        code: "CA-BC",
        taxType: "gst-pst",
        gstRate: 5,
        pstRate: 7,
        totalRate: 12,
      },
      {
        id: "ca-ab",
        name: "Alberta",
        code: "CA-AB",
        taxType: "gst",
        gstRate: 5,
        totalRate: 5,
      },
      {
        id: "ca-ns",
        name: "Nouvelle-Écosse",
        code: "CA-NS",
        taxType: "hst",
        hstRate: 15,
        totalRate: 15,
      },
      {
        id: "ca-nb",
        name: "Nouveau-Brunswick",
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
        name: "Taux Standard",
        code: "MX-STD",
        taxType: "iva-standard",
        ivaRate: 16,
        totalRate: 16,
      },
      {
        id: "mx-border",
        name: "Taux Frontalier",
        code: "MX-BOR",
        taxType: "iva-reduced",
        ivaRate: 8,
        totalRate: 8,
      },
      {
        id: "mx-zero",
        name: "Taux Zéro",
        code: "MX-ZER",
        taxType: "iva-zero",
        ivaRate: 0,
        totalRate: 0,
      },
      {
        id: "mx-exempt",
        name: "Exonéré",
        code: "MX-EXE",
        taxType: "iva-exempt",
        totalRate: 0,
      }
    ]
  }
];

// Configuration des taxes par défaut pour les profils clients
export const defaultTaxConfigs = {
  "european-union": {
    defaultTaxRate: 20,
    defaultRegion: "european-union:fr-standard",
    label: "TVA (UE)"
  },
  "switzerland": {
    defaultTaxRate: 8.1,
    defaultRegion: "switzerland:ch-standard",
    label: "MwSt./TVA/IVA (Schweiz/Suisse/Svizzera)"
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
