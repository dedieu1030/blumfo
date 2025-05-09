import { CurrencyInfo } from "@/types/invoice";

// Update currency information with correct position types
export const getCurrencies = (): { [key: string]: CurrencyInfo } => {
  return {
    USD: { code: "USD", name: "US Dollar", symbol: "$", position: "before" },
    EUR: { code: "EUR", name: "Euro", symbol: "€", position: "after" },
    GBP: { code: "GBP", name: "British Pound", symbol: "£", position: "before" },
    CAD: { code: "CAD", name: "Canadian Dollar", symbol: "$", position: "before" },
    AUD: { code: "AUD", name: "Australian Dollar", symbol: "$", position: "before" },
    JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", position: "before" },
    CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", position: "before" },
    CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", position: "before" },
    INR: { code: "INR", name: "Indian Rupee", symbol: "₹", position: "before" },
    BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", position: "before" },
    MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", position: "before" }
  };
};
