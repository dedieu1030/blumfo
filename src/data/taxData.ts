
import { TaxRegion } from "@/types/tax";

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

export const taxRegions: TaxRegion[] = [canadaTaxRegions];

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
    default:
      return "Taxes de vente";
  }
};
