
import { TaxZone, TaxRegionData, TAX_TYPES } from '@/types/tax';

// This function will be used to get the tax rate for a specific region
export function getTaxRateByRegion(regionKey?: string): number | null {
  if (!regionKey) return null;
  
  const [zoneId, countryId, regionId] = regionKey.split(':');
  
  const zone = taxZonesData.find(z => z.id === zoneId);
  if (!zone) return null;
  
  const country = zone.countries.find(c => c.id === countryId);
  if (!country) return null;
  
  const region = country.regions.find(r => r.id === regionId);
  if (!region) return null;
  
  return region.totalRate;
}

// Sample tax data - this would ideally come from an API or database
export const taxZonesData: TaxZone[] = [
  {
    id: 'europe',
    name: 'Europe',
    countries: [
      {
        id: 'fr',
        name: 'France',
        countryCode: 'FR',
        regions: [
          {
            id: 'fr-standard',
            name: 'TVA Standard',
            code: 'FR-STD',
            taxType: TAX_TYPES.VAT,
            standardRate: 20,
            vatStandardRate: 20,
            totalRate: 20,
          },
          {
            id: 'fr-reduced',
            name: 'TVA Réduite',
            code: 'FR-RED',
            taxType: TAX_TYPES.VAT,
            standardRate: 10,
            vatReducedRates: [10, 5.5],
            totalRate: 10,
          },
          {
            id: 'fr-special',
            name: 'TVA Spéciale (DOM-TOM)',
            code: 'FR-DOM',
            taxType: TAX_TYPES.VAT,
            standardRate: 8.5,
            vatReducedRates: [8.5, 2.1],
            totalRate: 8.5,
          },
          {
            id: 'fr-super-reduced',
            name: 'TVA Super Réduite',
            code: 'FR-SR',
            taxType: TAX_TYPES.VAT,
            standardRate: 2.1,
            vatSuperReducedRate: 2.1,
            totalRate: 2.1,
          },
          {
            id: 'fr-exempt',
            name: 'Exonéré de TVA',
            code: 'FR-EX',
            taxType: TAX_TYPES.NONE,
            standardRate: 0,
            totalRate: 0,
          }
        ]
      },
      {
        id: 'de',
        name: 'Allemagne',
        countryCode: 'DE',
        regions: [
          {
            id: 'de-standard',
            name: 'MwSt Standard',
            code: 'DE-STD',
            taxType: TAX_TYPES.VAT,
            standardRate: 19,
            vatStandardRate: 19,
            totalRate: 19,
          },
          {
            id: 'de-reduced',
            name: 'MwSt Réduite',
            code: 'DE-RED',
            taxType: TAX_TYPES.VAT,
            standardRate: 7,
            vatReducedRates: [7],
            totalRate: 7,
          },
          {
            id: 'de-exempt',
            name: 'Exonéré de TVA',
            code: 'DE-EX',
            taxType: TAX_TYPES.NONE,
            standardRate: 0,
            totalRate: 0,
          }
        ]
      },
      {
        id: 'it',
        name: 'Italie',
        countryCode: 'IT',
        regions: [
          {
            id: 'it-standard',
            name: 'IVA Standard',
            code: 'IT-STD',
            taxType: TAX_TYPES.VAT,
            standardRate: 22,
            vatStandardRate: 22,
            totalRate: 22,
          },
          {
            id: 'it-reduced',
            name: 'IVA Réduite',
            code: 'IT-RED',
            taxType: TAX_TYPES.VAT,
            standardRate: 10,
            vatReducedRates: [10, 5, 4],
            totalRate: 10,
          },
          {
            id: 'it-reduced-2',
            name: 'IVA Réduite (5%)',
            code: 'IT-RED2',
            taxType: TAX_TYPES.VAT,
            standardRate: 5,
            vatReducedRates: [5],
            totalRate: 5,
          },
          {
            id: 'it-super-reduced',
            name: 'IVA Super Réduite',
            code: 'IT-SR',
            taxType: TAX_TYPES.VAT,
            standardRate: 4,
            vatSuperReducedRate: 4,
            totalRate: 4,
          },
          {
            id: 'it-exempt',
            name: 'Exonéré de TVA',
            code: 'IT-EX',
            taxType: TAX_TYPES.NONE,
            standardRate: 0,
            totalRate: 0,
          }
        ]
      },
      {
        id: 'es',
        name: 'Espagne',
        countryCode: 'ES',
        regions: [
          {
            id: 'es-standard',
            name: 'IVA Standard',
            code: 'ES-STD',
            taxType: TAX_TYPES.VAT,
            standardRate: 21,
            vatStandardRate: 21,
            totalRate: 21,
          },
          {
            id: 'es-reduced',
            name: 'IVA Réduite',
            code: 'ES-RED',
            taxType: TAX_TYPES.VAT,
            standardRate: 10,
            vatReducedRates: [10],
            totalRate: 10,
          },
          {
            id: 'es-super-reduced',
            name: 'IVA Super Réduite',
            code: 'ES-SR',
            taxType: TAX_TYPES.VAT,
            standardRate: 4,
            vatSuperReducedRate: 4,
            totalRate: 4,
          },
          {
            id: 'es-exempt',
            name: 'Exonéré de TVA',
            code: 'ES-EX',
            taxType: TAX_TYPES.NONE,
            standardRate: 0,
            totalRate: 0,
          },
          {
            id: 'es-canary',
            name: 'IGIC (Îles Canaries)',
            code: 'ES-CAN',
            taxType: TAX_TYPES.VAT,
            standardRate: 7,
            vatStandardRate: 7,
            totalRate: 7,
          }
        ]
      }
    ]
  },
  {
    id: 'north-america',
    name: 'Amérique du Nord',
    countries: [
      {
        id: 'ca',
        name: 'Canada',
        countryCode: 'CA',
        regions: [
          {
            id: 'ca-standard',
            name: 'GST/HST Standard',
            code: 'CA-STD',
            taxType: TAX_TYPES.GST,
            standardRate: 5,
            vatStandardRate: 5,
            totalRate: 5,
          },
          {
            id: 'ca-hst',
            name: 'HST Ontario',
            code: 'CA-ONT',
            taxType: TAX_TYPES.HST,
            standardRate: 13,
            vatReducedRates: [13],
            totalRate: 13,
          },
          {
            id: 'ca-qst',
            name: 'GST + QST (Québec)',
            code: 'CA-QC',
            taxType: TAX_TYPES.GST,
            standardRate: 14.98, // 5% GST + 9.98% QST (9.975% on price+GST)
            vatReducedRates: [14.98],
            totalRate: 14.98,
          },
          {
            id: 'ca-exempt',
            name: 'Exonéré de taxe',
            code: 'CA-EX',
            taxType: TAX_TYPES.NONE,
            standardRate: 0,
            totalRate: 0,
          }
        ]
      },
      {
        id: 'us',
        name: 'États-Unis',
        countryCode: 'US',
        regions: [
          {
            id: 'us-standard',
            name: 'Sales Tax Standard',
            code: 'US-STD',
            taxType: TAX_TYPES.OTHER,
            standardRate: 7.25, // Example for California
            vatStandardRate: 7.25,
            totalRate: 7.25,
          },
          {
            id: 'us-ny',
            name: 'Sales Tax (New York)',
            code: 'US-NY',
            taxType: TAX_TYPES.OTHER,
            standardRate: 8.875,
            vatReducedRates: [8.875],
            totalRate: 8.875,
          },
          {
            id: 'us-tx',
            name: 'Sales Tax (Texas)',
            code: 'US-TX',
            taxType: TAX_TYPES.OTHER,
            standardRate: 6.25,
            vatReducedRates: [6.25],
            totalRate: 6.25,
          },
          {
            id: 'us-fl',
            name: 'Sales Tax (Floride)',
            code: 'US-FL',
            taxType: TAX_TYPES.OTHER,
            standardRate: 6,
            vatReducedRates: [6],
            totalRate: 6,
          },
          {
            id: 'us-tax-exempt',
            name: 'Exonéré de taxe',
            code: 'US-EX',
            taxType: TAX_TYPES.NONE,
            standardRate: 0,
            totalRate: 0,
          }
        ]
      }
    ]
  }
];
