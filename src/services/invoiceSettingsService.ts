import { CurrencyInfo } from "@/types/invoice";

export function getCurrencyInfo(currencyCode: string = 'EUR'): CurrencyInfo {
  const currencyMap: Record<string, CurrencyInfo> = {
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      decimalPlaces: 2,
      symbolPosition: 'after', // Changé de 'suffix' à 'after' pour être conforme au type
      decimalSeparator: ',',
      thousandSeparator: ' '
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    CAD: {
      code: 'CAD',
      symbol: '$',
      name: 'Canadian Dollar',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    AUD: {
      code: 'AUD',
      symbol: '$',
      name: 'Australian Dollar',
      decimalPlaces: 2,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    JPY: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      decimalPlaces: 0,
      symbolPosition: 'before',
      decimalSeparator: '',
      thousandSeparator: ','
    },
    CHF: {
      code: 'CHF',
      symbol: 'Fr',
      name: 'Swiss Franc',
      decimalPlaces: 2,
      symbolPosition: 'after',
      decimalSeparator: '.',
      thousandSeparator: '\''
    }
  };

  return currencyMap[currencyCode] || currencyMap.EUR;
}
