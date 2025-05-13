
import React from "react";
import { cn } from "@/lib/utils";

// Types for formatting options
export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  notation?: "standard" | "scientific" | "engineering" | "compact";
  className?: string;
}

export interface CurrencyFormatOptions extends NumberFormatOptions {
  currency?: string;
  currencyDisplay?: "symbol" | "code" | "name" | "narrowSymbol";
  signDisplay?: "auto" | "always" | "exceptZero" | "never";
  currencyPosition?: "prefix" | "suffix";
}

export interface PercentageFormatOptions extends NumberFormatOptions {
  signDisplay?: "auto" | "always" | "exceptZero" | "never";
}

// Utility formatting functions
export const formatNumber = (
  value: number | string | undefined | null,
  options: NumberFormatOptions = {}
): string => {
  if (value === undefined || value === null || value === "") return "-";
  
  // Convert string to number if needed
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  // Check if the value is a valid number
  if (isNaN(numValue)) return "-";
  
  const {
    locale = "fr-FR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
    notation = "standard"
  } = options;
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    notation
  }).format(numValue);
};

export const formatCurrency = (
  value: number | string | undefined | null,
  options: CurrencyFormatOptions = {}
): string => {
  if (value === undefined || value === null || value === "") return "-";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "-";
  
  const {
    locale = "fr-FR",
    currency = "EUR",
    currencyDisplay = "symbol",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useGrouping = true,
    signDisplay = "auto",
    currencyPosition = "suffix"
  } = options;
  
  // Standard currency formatting
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    signDisplay
  }).format(numValue);
  
  // Handle currency position if needed (for locales that don't follow the desired positioning)
  if (currencyPosition === "suffix" && formatted.startsWith(currency)) {
    // If we want suffix but it's currently prefix
    return formatted.replace(`${currency} `, "") + ` ${currency}`;
  } else if (currencyPosition === "prefix" && !formatted.startsWith(currency)) {
    // If we want prefix but it's currently suffix
    return `${currency} ` + formatted.replace(` ${currency}`, "");
  }
  
  return formatted;
};

export const formatPercentage = (
  value: number | string | undefined | null,
  options: PercentageFormatOptions = {}
): string => {
  if (value === undefined || value === null || value === "") return "-";
  
  // Convert to number and normalize decimal values (0.5 = 50%)
  let numValue: number;
  if (typeof value === "string") {
    numValue = parseFloat(value);
  } else {
    numValue = value;
  }
  
  if (isNaN(numValue)) return "-";
  
  // Normalize percentage value (if it's already in percentage format like 50, don't divide by 100)
  if (Math.abs(numValue) < 1) {
    numValue = numValue * 100;
  }
  
  const {
    locale = "fr-FR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    useGrouping = true,
    signDisplay = "auto"
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    signDisplay
  }).format(numValue / 100);
};

export const formatCompact = (
  value: number | string | undefined | null,
  options: NumberFormatOptions = {}
): string => {
  if (value === undefined || value === null || value === "") return "-";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "-";
  
  const {
    locale = "fr-FR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    useGrouping = true
  } = options;
  
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(numValue);
};

// React component wrappers
export const NumberFormat: React.FC<{
  value: number | string | undefined | null;
  options?: NumberFormatOptions;
  className?: string;
}> = ({ value, options = {}, className }) => {
  return <span className={cn(className)}>{formatNumber(value, options)}</span>;
};

export const CurrencyFormat: React.FC<{
  value: number | string | undefined | null;
  options?: CurrencyFormatOptions;
  className?: string;
}> = ({ value, options = {}, className }) => {
  return <span className={cn(className)}>{formatCurrency(value, options)}</span>;
};

export const PercentageFormat: React.FC<{
  value: number | string | undefined | null;
  options?: PercentageFormatOptions;
  className?: string;
}> = ({ value, options = {}, className }) => {
  return <span className={cn(className)}>{formatPercentage(value, options)}</span>;
};

export const CompactNumberFormat: React.FC<{
  value: number | string | undefined | null;
  options?: NumberFormatOptions;
  className?: string;
}> = ({ value, options = {}, className }) => {
  return <span className={cn(className)}>{formatCompact(value, { ...options, notation: "compact" })}</span>;
};
