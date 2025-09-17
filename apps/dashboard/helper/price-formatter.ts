/**
 * Format price with currency symbol
 * @param price - The price value
 * @param currency - The currency code (e.g., 'IDR', 'USD', 'EUR')
 * @returns Formatted price string with currency symbol
 */
export const formatPriceWithCurrency = (price: number, currency: string): string => {
  if (!price || price === 0) {
    return "Gratis";
  }

  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    IDR: "Rp",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    SGD: "S$",
    MYR: "RM",
    THB: "฿",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    HKD: "HK$",
    KRW: "₩",
    NZD: "NZ$",
    PHP: "₱",
    VND: "₫",
    INR: "₹",
    BRL: "R$",
    MXN: "$",
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Format number with thousand separators
  const formattedNumber = new Intl.NumberFormat("id-ID").format(price);
  
  return `${symbol} ${formattedNumber}`;
};
