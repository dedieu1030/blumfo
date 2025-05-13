import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatCurrency as formatCurrencyUtil, formatPercentage as formatPercentageUtil } from "@/components/ui/number-format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export the formatting functions from our new component for backward compatibility
export const formatCurrency = formatCurrencyUtil;
export const formatPercentage = formatPercentageUtil;

// Format tax rate to prevent overflow (max 1 decimal place)
export function formatTaxRate(rate: number): string {
  if (rate === undefined || rate === null) return "-";
  
  // Cas particulier pour le taux du Québec (14.975%)
  if (Math.abs(rate - 14.975) < 0.001) {
    return "15";
  }
  
  // Check if the value is a whole number
  if (Number.isInteger(rate)) {
    return rate.toString();
  }
  
  // Pour les autres taux avec parties décimales
  // Arrondir à 1 décimale si > 0.1, sinon afficher entier
  const roundedValue = Math.abs(rate % 1) < 0.1 ? Math.round(rate) : Number(rate.toFixed(1));
  return roundedValue.toString();
}

// Keep the formatDate function
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

// Get payment method icon by code
export function getPaymentMethodIcon(code: string): string {
  switch (code) {
    case 'card':
      return 'credit-card';
    case 'bank_transfer':
      return 'bank';
    case 'check':
      return 'file-check';
    case 'cash':
      return 'banknote';
    case 'paypal':
      return 'credit-card';
    default:
      return 'credit-card';
  }
}

// Format payment status
export function formatPaymentStatus(status: string): { label: string; variant: string } {
  switch (status) {
    case 'completed':
      return { label: 'Payé', variant: 'success' };
    case 'pending':
      return { label: 'En attente', variant: 'warning' };
    case 'failed':
      return { label: 'Échoué', variant: 'destructive' };
    default:
      return { label: status, variant: 'default' };
  }
}
