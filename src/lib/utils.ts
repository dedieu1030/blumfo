import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatCurrency as formatCurrencyUtil, formatPercentage as formatPercentageUtil } from "@/components/ui/number-format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export the formatting functions from our new component for backward compatibility
export const formatCurrency = formatCurrencyUtil;
export const formatPercentage = formatPercentageUtil;

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
