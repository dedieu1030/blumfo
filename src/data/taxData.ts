
import { TaxZone, TaxCountry, TaxRegionData } from "@/types/tax";

// Données des zones fiscales
export const taxZonesData: TaxZone[] = [
  {
    id: "european-union",
    name: "Union Européenne",
    countries: [
      {
        id: "fr",
        name: "France",
        countryCode: "FR",
        regions: [
          {
            id: "fr-standard",
            name: "TVA Standard (20%)",
            code: "FR-STD",
            taxType: "vat-standard",
            vatStandardRate: 20,
            totalRate: 20,
          },
          {
            id: "fr-intermediate",
            name: "TVA Intermédiaire (10%)",
            code: "FR-INT",
            taxType: "vat-reduced",
            vatReducedRates: [10],
            totalRate: 10,
          },
          {
            id: "fr-reduced",
            name: "TVA Réduite (5.5%)",
            code: "FR-RED",
            taxType: "vat-reduced",
            vatReducedRates: [5.5],
            totalRate: 5.5,
          },
          {
            id: "fr-super-reduced",
            name: "TVA Super Réduite (2.1%)",
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
        id: "de",
        name: "Allemagne",
        countryCode: "DE",
        regions: [
          {
            id: "de-standard",
            name: "TVA Standard (19%)",
            code: "DE-STD",
            taxType: "vat-standard",
            vatStandardRate: 19,
            totalRate: 19,
          },
          {
            id: "de-reduced",
            name: "TVA Réduite (7%)",
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
        id: "es",
        name: "Espagne",
        countryCode: "ES",
        regions: [
          {
            id: "es-standard",
            name: "TVA Standard (21%)",
            code: "ES-STD",
            taxType: "vat-standard",
            vatStandardRate: 21,
            totalRate: 21,
          },
          {
            id: "es-reduced",
            name: "TVA Réduite (10%)",
            code: "ES-RED",
            taxType: "vat-reduced",
            vatReducedRates: [10],
            totalRate: 10,
          },
          {
            id: "es-super-reduced",
            name: "TVA Super Réduite (4%)",
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
            name: "Îles Canaries (7%)",
            code: "ES-CAN",
            taxType: "vat-standard",
            vatStandardRate: 7,
            totalRate: 7,
          }
        ]
      },
      {
        id: "it",
        name: "Italie",
        countryCode: "IT",
        regions: [
          {
            id: "it-standard",
            name: "TVA Standard (22%)",
            code: "IT-STD",
            taxType: "vat-standard",
            vatStandardRate: 22,
            totalRate: 22,
          },
          {
            id: "it-reduced-10",
            name: "TVA Réduite (10%)",
            code: "IT-RED",
            taxType: "vat-reduced",
            vatReducedRates: [10],
            totalRate: 10,
          },
          {
            id: "it-reduced-5",
            name: "TVA Super Réduite (5%)",
            code: "IT-SRD",
            taxType: "vat-reduced",
            vatReducedRates: [5],
            totalRate: 5,
          },
          {
            id: "it-super-reduced",
            name: "TVA Minimale (4%)",
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
        id: "be",
        name: "Belgique",
        countryCode: "BE",
        regions: [
          {
            id: "be-standard",
            name: "TVA Standard (21%)",
            code: "BE-STD",
            taxType: "vat-standard",
            vatStandardRate: 21,
            totalRate: 21,
          },
          {
            id: "be-reduced-12",
            name: "TVA Réduite (12%)",
            code: "BE-R12",
            taxType: "vat-reduced",
            vatReducedRates: [12],
            totalRate: 12,
          },
          {
            id: "be-reduced-6",
            name: "TVA Réduite (6%)",
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
        id: "nl",
        name: "Pays-Bas",
        countryCode: "NL",
        regions: [
          {
            id: "nl-standard",
            name: "TVA Standard (21%)",
            code: "NL-STD",
            taxType: "vat-standard",
            vatStandardRate: 21,
            totalRate: 21,
          },
          {
            id: "nl-reduced",
            name: "TVA Réduite (9%)",
            code: "NL-RED",
            taxType: "vat-reduced",
            vatReducedRates: [9],
            totalRate: 9,
          }
        ]
      },
      {
        id: "ch",
        name: "Suisse",
        countryCode: "CH",
        regions: [
          {
            id: "ch-standard",
            name: "TVA Standard (8.1%)",
            code: "CH-NOR",
            taxType: "vat-standard",
            vatStandardRate: 8.1,
            totalRate: 8.1,
          },
          {
            id: "ch-reduced",
            name: "TVA Réduite (2.6%)",
            code: "CH-RED",
            taxType: "vat-reduced",
            vatReducedRates: [2.6],
            totalRate: 2.6,
          },
          {
            id: "ch-special",
            name: "TVA Hébergement (3.8%)",
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
        id: "uk",
        name: "Royaume-Uni",
        countryCode: "GB",
        regions: [
          {
            id: "uk-standard",
            name: "TVA Standard (20%)",
            code: "GB-STD",
            taxType: "vat-standard",
            vatStandardRate: 20,
            totalRate: 20,
          },
          {
            id: "uk-reduced",
            name: "TVA Réduite (5%)",
            code: "GB-RED",
            taxType: "vat-reduced",
            vatReducedRates: [5],
            totalRate: 5,
          },
          {
            id: "uk-zero",
            name: "TVA Zéro",
            code: "GB-ZER",
            taxType: "vat-reduced",
            vatReducedRates: [0],
            totalRate: 0,
          },
          {
            id: "uk-exempt",
            name: "Exonéré",
            code: "GB-EXE",
            taxType: "vat-exempt",
            totalRate: 0,
          }
        ]
      }
    ]
  },
  {
    id: "north-america",
    name: "Amérique du Nord",
    countries: [
      {
        id: "ca",
        name: "Canada",
        countryCode: "CA",
        regions: [
          {
            id: "ca-ab",
            name: "Alberta (TPS - 5%)",
            code: "CA-AB",
            taxType: "gst",
            gstRate: 5,
            totalRate: 5,
          },
          {
            id: "ca-bc",
            name: "Colombie-Britannique (TPS+TVP - 12%)",
            code: "CA-BC",
            taxType: "gst-pst",
            gstRate: 5,
            pstRate: 7,
            totalRate: 12,
          },
          {
            id: "ca-mb",
            name: "Manitoba (TPS+TVP - 12%)",
            code: "CA-MB",
            taxType: "gst-pst",
            gstRate: 5,
            pstRate: 7,
            totalRate: 12,
          },
          {
            id: "ca-nb",
            name: "Nouveau-Brunswick (TVH - 15%)",
            code: "CA-NB",
            taxType: "hst",
            hstRate: 15,
            totalRate: 15,
          },
          {
            id: "ca-nl",
            name: "Terre-Neuve-et-Labrador (TVH - 15%)",
            code: "CA-NL",
            taxType: "hst",
            hstRate: 15,
            totalRate: 15,
          },
          {
            id: "ca-ns",
            name: "Nouvelle-Écosse (TVH - 14%)",
            code: "CA-NS",
            taxType: "hst",
            hstRate: 14,
            totalRate: 14,
          },
          {
            id: "ca-nt",
            name: "Territoires du Nord-Ouest (TPS - 5%)",
            code: "CA-NT",
            taxType: "gst",
            gstRate: 5,
            totalRate: 5,
          },
          {
            id: "ca-nu",
            name: "Nunavut (TPS - 5%)",
            code: "CA-NU",
            taxType: "gst",
            gstRate: 5,
            totalRate: 5,
          },
          {
            id: "ca-on",
            name: "Ontario (TVH - 13%)",
            code: "CA-ON",
            taxType: "hst",
            hstRate: 13,
            totalRate: 13,
          },
          {
            id: "ca-pe",
            name: "Île-du-Prince-Édouard (TVH - 15%)",
            code: "CA-PE",
            taxType: "hst",
            hstRate: 15,
            totalRate: 15,
          },
          {
            id: "ca-qc",
            name: "Québec (TPS+TVQ - 14.975%)",
            code: "CA-QC",
            taxType: "gst-qst",
            gstRate: 5,
            qstRate: 9.975,
            totalRate: 14.975,
          },
          {
            id: "ca-sk",
            name: "Saskatchewan (TPS+TVP - 11%)",
            code: "CA-SK",
            taxType: "gst-pst",
            gstRate: 5,
            pstRate: 6,
            totalRate: 11,
          },
          {
            id: "ca-yt",
            name: "Yukon (TPS - 5%)",
            code: "CA-YT",
            taxType: "gst",
            gstRate: 5,
            totalRate: 5,
          }
        ]
      },
      {
        id: "us",
        name: "États-Unis",
        countryCode: "US",
        regions: [
          {
            id: "us-ca",
            name: "Californie (7.25%)",
            code: "US-CA",
            taxType: "sales-tax",
            stateTaxRate: 7.25,
            totalRate: 7.25,
            notes: "Peut atteindre 10,75% avec taxes locales"
          },
          {
            id: "us-ny",
            name: "New York (8.875%)",
            code: "US-NY",
            taxType: "sales-tax",
            stateTaxRate: 4,
            localTaxRate: 4.875,
            totalRate: 8.875,
          },
          {
            id: "us-tx",
            name: "Texas (8.25%)",
            code: "US-TX",
            taxType: "sales-tax",
            stateTaxRate: 6.25,
            localTaxRate: 2,
            totalRate: 8.25,
          },
          {
            id: "us-fl",
            name: "Floride (8.5%)",
            code: "US-FL",
            taxType: "sales-tax",
            stateTaxRate: 6,
            localTaxRate: 2.5,
            totalRate: 8.5,
          },
          {
            id: "us-or",
            name: "Oregon (Pas de taxe)",
            code: "US-OR",
            taxType: "no-tax",
            totalRate: 0,
            notes: "Pas de taxe de vente dans l'Oregon"
          },
          {
            id: "us-ak",
            name: "Alaska (Pas de taxe d'État)",
            code: "US-AK",
            taxType: "no-tax",
            totalRate: 0,
            notes: "Pas de taxe de vente d'État, taxes locales uniquement"
          }
        ]
      },
      {
        id: "mx",
        name: "Mexique",
        countryCode: "MX",
        regions: [
          {
            id: "mx-standard",
            name: "IVA Standard (16%)",
            code: "MX-STD",
            taxType: "iva-standard",
            ivaRate: 16,
            totalRate: 16,
          },
          {
            id: "mx-border",
            name: "IVA Frontalier (8%)",
            code: "MX-BOR",
            taxType: "iva-reduced",
            ivaRate: 8,
            totalRate: 8,
          },
          {
            id: "mx-zero",
            name: "IVA Zéro",
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
          },
          {
            id: "mx-ish",
            name: "Taxe d'hébergement (3%)",
            code: "MX-ISH",
            taxType: "iva-special",
            ivaRate: 3,
            totalRate: 3,
            notes: "Taux moyen, varie entre 2% et 5% selon les États"
          }
        ]
      }
    ]
  }
];

// Pour la rétrocompatibilité
export const taxRegionsData = taxZonesData.flatMap(zone => 
  zone.countries.map(country => {
    return {
      id: country.id,
      name: country.name,
      countryCode: country.countryCode,
      regions: country.regions
    };
  })
);

// Configuration des taxes par défaut pour les profils clients
export const defaultTaxConfigs = {
  "european-union": {
    defaultTaxRate: 20,
    defaultRegion: "european-union:fr:fr-standard",
    label: "TVA (UE)"
  },
  "north-america": {
    defaultTaxRate: 5,
    defaultRegion: "north-america:ca:ca-ab",
    label: "Sales Tax (North America)"
  }
};

// Fonction utilitaire pour obtenir le taux de TVA par région
export const getTaxRateByRegion = (regionKey: string): number => {
  if (!regionKey) return 20; // Taux par défaut
  
  const [zoneId, countryId, regionId] = regionKey.split(":");
  
  const zone = taxZonesData.find(z => z.id === zoneId);
  if (!zone) return 20;
  
  const country = zone.countries.find(c => c.id === countryId);
  if (!country) return 20;
  
  const region = country.regions.find(r => r.id === regionId);
  return region ? region.totalRate : 20;
};

// Fonction pour obtenir les options de taxe par pays
export const getTaxOptionsForCountry = (countryKey: string) => {
  if (!countryKey) return [];
  
  const [zoneId, countryId] = countryKey.split(":");
  
  const zone = taxZonesData.find(z => z.id === zoneId);
  if (!zone) return [];
  
  const country = zone.countries.find(c => c.id === countryId);
  if (!country) return [];
  
  return country.regions.map(region => ({
    id: `${zoneId}:${countryId}:${region.id}`,
    name: region.name,
    rate: region.totalRate,
    code: region.code
  }));
};

// Fonction pour obtenir le taux de TVA d'une région spécifique
export const getTaxRateForRegion = (zoneId: string, countryId: string, regionId: string): number => {
  const zone = taxZonesData.find(z => z.id === zoneId);
  if (!zone) return 20;
  
  const country = zone.countries.find(c => c.id === countryId);
  if (!country) return 20;
  
  const region = country.regions.find(r => r.id === regionId);
  return region ? region.totalRate : 20;
};
