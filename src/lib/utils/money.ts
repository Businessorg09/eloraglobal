/**
 * Utility functions for money conversions and formatting.
 * ALL money calculations use integers to avoid floating point issues.
 * PAISE is the base unit for INR (1 INR = 100 Paise)
 * CENTS is the base unit for USD (1 USD = 100 Cents)
 */

export function inrToPaise(inr: number): number {
  return Math.floor(inr * 100);
}

export function paiseToInr(paise: number): number {
  return Math.floor(paise / 100);
}

export function usdToCents(usd: number): number {
  return Math.floor(usd * 100);
}

export function centsToUsd(cents: number): number {
  return Math.floor(cents / 100);
}

export function convertUsdToInrPaise(usdCents: number, exchangeRate: number): number {
  // Exchange rate is typically like 83.50, so we just multiply cents by exchangeRate
  // because usdCents / 100 * exchangeRate * 100 = usdCents * exchangeRate
  return Math.floor(usdCents * exchangeRate);
}

export function formatInr(paise: number): string {
  const inr = paiseToInr(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inr);
}

export function formatUsd(cents: number): string {
  const usd = centsToUsd(cents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

export function percentageOf(amount: number, percentage: number): number {
  return Math.floor((amount * percentage) / 100);
}
