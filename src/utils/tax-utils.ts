
/**
 * Format a tax rate with correct number of decimal places
 */
export function formatTaxRate(rate: number): string {
  if (Number.isInteger(rate)) {
    return rate.toString();
  }
  
  // Show decimal places only if necessary
  return rate.toFixed(1).replace(/\.0$/, '');
}

/**
 * Types for tax navigation
 */
export type NavigationLevel = 'zones' | 'countries' | 'regions';
