import { TaxRegion, TaxRegionData } from "@/types/tax";

export const canadaTaxRegions: TaxRegion = {
  id: "canada",
  name: "Canada",
  countryCode: "CA",
  regions: [
    {
      id: "ab",
      name: "Alberta",
      code: "AB",
      taxType: "gst",
      gstRate: 5,
      totalRate: 5,
      notes: "Taxe fédérale uniquement, pas de taxe provinciale"
    },
    {
      id: "bc",
      name: "Colombie-Britannique",
      code: "BC",
      taxType: "gst-pst",
      gstRate: 5,
      pstRate: 7,
      totalRate: 12,
      notes: "TPS + TVP, administrée par la province"
    },
    {
      id: "mb",
      name: "Manitoba",
      code: "MB",
      taxType: "gst-pst",
      gstRate: 5,
      pstRate: 7,
      totalRate: 12,
      notes: "TPS + RST (Retail Sales Tax)"
    },
    {
      id: "nb",
      name: "Nouveau-Brunswick",
      code: "NB",
      taxType: "hst",
      hstRate: 15,
      totalRate: 15,
      notes: "TVH combinée"
    },
    {
      id: "nl",
      name: "Terre-Neuve-et-Labrador",
      code: "NL",
      taxType: "hst",
      hstRate: 15,
      totalRate: 15,
      notes: "TVH combinée"
    },
    {
      id: "ns",
      name: "Nouvelle-Écosse",
      code: "NS",
      taxType: "hst",
      hstRate: 14,
      totalRate: 14,
      notes: "TVH, réduite de 1% en avril 2025"
    },
    {
      id: "nt",
      name: "Territoires du Nord-Ouest",
      code: "NT",
      taxType: "gst",
      gstRate: 5,
      totalRate: 5,
      notes: "Taxe fédérale uniquement, pas de taxe territoriale"
    },
    {
      id: "nu",
      name: "Nunavut",
      code: "NU",
      taxType: "gst",
      gstRate: 5,
      totalRate: 5,
      notes: "Taxe fédérale uniquement, pas de taxe territoriale"
    },
    {
      id: "on",
      name: "Ontario",
      code: "ON",
      taxType: "hst",
      hstRate: 13,
      totalRate: 13,
      notes: "TVH combinée"
    },
    {
      id: "pe",
      name: "Île-du-Prince-Édouard",
      code: "PE",
      taxType: "hst",
      hstRate: 15,
      totalRate: 15,
      notes: "TVH combinée"
    },
    {
      id: "qc",
      name: "Québec",
      code: "QC",
      taxType: "gst-qst",
      gstRate: 5,
      qstRate: 9.975,
      totalRate: 14.975,
      notes: "TPS + TVQ, administrée par Revenu Québec"
    },
    {
      id: "sk",
      name: "Saskatchewan",
      code: "SK",
      taxType: "gst-pst",
      gstRate: 5,
      pstRate: 6,
      totalRate: 11,
      notes: "TPS + TVP, administrée par la province"
    },
    {
      id: "yt",
      name: "Yukon",
      code: "YT",
      taxType: "gst",
      gstRate: 5,
      totalRate: 5,
      notes: "Taxe fédérale uniquement, pas de taxe territoriale"
    }
  ]
};

export const usaTaxRegions: TaxRegion = {
  id: "usa",
  name: "États-Unis",
  countryCode: "US",
  regions: [
    {
      id: "ca",
      name: "Californie",
      code: "CA",
      taxType: "sales-tax",
      stateTaxRate: 7.25,
      localTaxRate: 1.6,
      totalRate: 8.85,
      notes: "Taux d'État 7.25% + taux local moyen 1.6%"
    },
    {
      id: "in",
      name: "Indiana",
      code: "IN",
      taxType: "sales-tax",
      stateTaxRate: 7.0,
      localTaxRate: 0,
      totalRate: 7.0,
      notes: "Taxe de vente uniforme au niveau de l'État"
    },
    {
      id: "ms",
      name: "Mississippi",
      code: "MS",
      taxType: "sales-tax",
      stateTaxRate: 7.0,
      localTaxRate: 0.06,
      totalRate: 7.06,
      notes: "Taux d'État 7% + faible taux local moyen"
    },
    {
      id: "ri",
      name: "Rhode Island",
      code: "RI",
      taxType: "sales-tax",
      stateTaxRate: 7.0,
      localTaxRate: 0,
      totalRate: 7.0,
      notes: "Taxe de vente uniforme au niveau de l'État"
    },
    {
      id: "tn",
      name: "Tennessee",
      code: "TN",
      taxType: "sales-tax",
      stateTaxRate: 7.0,
      localTaxRate: 2.55,
      totalRate: 9.55,
      notes: "Taux d'État 7% + taux local moyen élevé"
    },
    {
      id: "la",
      name: "Louisiane",
      code: "LA",
      taxType: "sales-tax",
      stateTaxRate: 5.0,
      localTaxRate: 5.11,
      totalRate: 10.11,
      notes: "Un des taux combinés les plus élevés aux États-Unis"
    },
    {
      id: "ny",
      name: "New York",
      code: "NY",
      taxType: "sales-tax",
      stateTaxRate: 4.0,
      localTaxRate: 4.53,
      totalRate: 8.53,
      notes: "Taux local moyen plus élevé que le taux d'État"
    },
    {
      id: "tx",
      name: "Texas",
      code: "TX",
      taxType: "sales-tax",
      stateTaxRate: 6.25,
      localTaxRate: 1.95,
      totalRate: 8.20,
      notes: "Taux d'État 6.25% + taxe locale variable selon la juridiction"
    },
    {
      id: "fl",
      name: "Floride",
      code: "FL",
      taxType: "sales-tax",
      stateTaxRate: 6.0,
      localTaxRate: 1.0,
      totalRate: 7.0,
      notes: "Taux d'État 6% + supplément local moyen de 1%"
    },
    {
      id: "il",
      name: "Illinois",
      code: "IL",
      taxType: "sales-tax",
      stateTaxRate: 6.25,
      localTaxRate: 2.61,
      totalRate: 8.86,
      notes: "Taux d'État 6.25% + taxes locales significatives"
    },
    {
      id: "co",
      name: "Colorado",
      code: "CO",
      taxType: "sales-tax",
      stateTaxRate: 2.9,
      localTaxRate: 4.91,
      totalRate: 7.81,
      notes: "Faible taux d'État mais taxes locales élevées"
    },
    {
      id: "ak",
      name: "Alaska",
      code: "AK",
      taxType: "sales-tax",
      stateTaxRate: 0,
      localTaxRate: 1.82,
      totalRate: 1.82,
      notes: "Pas de taxe au niveau de l'État, uniquement des taxes locales variables"
    },
    {
      id: "de",
      name: "Delaware",
      code: "DE",
      taxType: "no-tax",
      stateTaxRate: 0,
      localTaxRate: 0,
      totalRate: 0,
      notes: "Pas de taxe de vente d'État ni locale"
    },
    {
      id: "mt",
      name: "Montana",
      code: "MT",
      taxType: "no-tax",
      stateTaxRate: 0,
      localTaxRate: 0,
      totalRate: 0,
      notes: "Pas de taxe de vente d'État ni locale"
    },
    {
      id: "nh",
      name: "New Hampshire",
      code: "NH",
      taxType: "no-tax",
      stateTaxRate: 0,
      localTaxRate: 0,
      totalRate: 0,
      notes: "Pas de taxe de vente d'État ni locale"
    },
    {
      id: "or",
      name: "Oregon",
      code: "OR",
      taxType: "no-tax",
      stateTaxRate: 0,
      localTaxRate: 0,
      totalRate: 0,
      notes: "Pas de taxe de vente d'État ni locale"
    }
  ]
};

export const mexicoTaxRegions: TaxRegion = {
  id: "mexico",
  name: "Mexique",
  countryCode: "MX",
  regions: [
    {
      id: "standard",
      name: "Taux standard",
      code: "STD",
      taxType: "iva-standard",
      ivaRate: 16,
      totalRate: 16,
      notes: "Appliqué à la majorité des biens et services."
    },
    {
      id: "reduced",
      name: "Taux réduit (régions frontalières)",
      code: "RED",
      taxType: "iva-reduced",
      ivaRate: 8,
      totalRate: 8,
      notes: "Appliqué dans certaines régions frontalières nord et sud."
    },
    {
      id: "zero",
      name: "Taux zéro",
      code: "ZER",
      taxType: "iva-zero",
      ivaRate: 0,
      totalRate: 0,
      notes: "Appliqué aux exportations, médicaments, aliments de base, livres, etc."
    },
    {
      id: "exempt",
      name: "Exonéré",
      code: "EXE",
      taxType: "iva-exempt",
      ivaRate: 0,
      totalRate: 0,
      notes: "Services comme l'éducation, les transports publics urbains et les services médicaux."
    }
  ]
};

export const taxRegions: TaxRegion[] = [canadaTaxRegions, usaTaxRegions, mexicoTaxRegions];

export const getTaxRegionById = (countryId: string): TaxRegion | undefined => {
  return taxRegions.find(region => region.id === countryId);
};

export const getRegionData = (countryId: string, regionId: string): TaxRegionData | undefined => {
  const country = getTaxRegionById(countryId);
  if (!country) return undefined;
  
  return country.regions.find(region => region.id === regionId);
};

export const getTaxTypeLabel = (taxType: string): string => {
  switch (taxType) {
    case "gst":
      return "TPS uniquement";
    case "gst-pst":
      return "TPS + TVP";
    case "gst-qst":
      return "TPS + TVQ";
    case "hst":
      return "TVH (Taxe harmonisée)";
    case "sales-tax":
      return "Taxe de vente";
    case "no-tax":
      return "Exonéré de taxe";
    case "iva-standard":
      return "IVA (Taux standard)";
    case "iva-reduced":
      return "IVA (Taux réduit)";
    case "iva-zero":
      return "IVA (Taux zéro)";
    case "iva-exempt":
      return "Exonéré d'IVA";
    default:
      return "Taxes de vente";
  }
};
