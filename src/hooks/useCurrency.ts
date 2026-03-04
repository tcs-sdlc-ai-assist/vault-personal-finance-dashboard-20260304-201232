import { useMemo } from 'react';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from 'src/lib/constants';
import { formatCurrency } from 'src/lib/formatters';

/************************************************************
 * useCurrency.ts
 * Vault - Custom hook for currency formatting and symbol logic.
 * - Provides currency code, symbol, formatter, and display helpers.
 * - Used in currency display components, forms, and analytics.
 ************************************************************/

/**
 * CurrencyInfo - Info about a supported currency.
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

/**
 * useCurrency
 * - Returns currency info and formatting helpers for the given currency code.
 * - Defaults to app's DEFAULT_CURRENCY if not specified.
 * @param currencyCode Optional currency code (e.g., 'USD')
 * @param locale Optional locale (defaults to browser or 'en-US')
 * @returns {
 *   code: string,
 *   symbol: string,
 *   name: string,
 *   format: (amount: number) => string,
 *   formatRaw: (amount: number) => string,
 *   supportedCurrencies: CurrencyInfo[],
 * }
 */
export default function useCurrency(
  currencyCode?: string,
  locale?: string
) {
  // Resolve currency info
  const info = useMemo<CurrencyInfo>(() => {
    const code = currencyCode || DEFAULT_CURRENCY;
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) return found;
    // Fallback: use USD
    return SUPPORTED_CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY)!;
  }, [currencyCode]);

  // Formatter: locale-aware, with symbol
  const format = useMemo(
    () => (amount: number) => formatCurrency(amount, info.code, locale),
    [info.code, locale]
  );

  // Formatter: raw, symbol + amount (fallback)
  const formatRaw = useMemo(
    () => (amount: number) => `${info.symbol}${amount.toFixed(2)}`,
    [info.symbol]
  );

  // Supported currencies list
  const supportedCurrencies = SUPPORTED_CURRENCIES;

  return {
    code: info.code,
    symbol: info.symbol,
    name: info.name,
    format,
    formatRaw,
    supportedCurrencies,
  };
}