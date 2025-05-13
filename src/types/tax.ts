
export interface TaxConfiguration {
  defaultTaxRate: number | string;
  region?: string;
  country?: string;
  useCustomRates?: boolean;
  customRates?: Record<string, number>;
}

export type TaxRateType = 'standard' | 'reduced' | 'super_reduced' | 'zero' | 'exempt' | 'custom';

export interface TaxRate {
  id: string;
  rate: number;
  name: string;
  type: TaxRateType;
  country?: string;
  region?: string;
  active?: boolean;
}
