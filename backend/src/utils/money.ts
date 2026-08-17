/** Store money as integer cents to avoid floating-point issues */
export const toCents = (amount: number): number => Math.round(amount * 100);

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (cents: number): string =>
  `$${(cents / 100).toFixed(2)}`;
