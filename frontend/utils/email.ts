const ALLOWED_EMAIL_DOMAINS = new Set(['ecommerce.com', 'gmail.com']);

export const ALLOWED_EMAIL_DOMAINS_MESSAGE =
  'Email must be an @ecommerce.com or @gmail.com address';

export function isAllowedCustomerSupplierEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[0]) return false;
  return ALLOWED_EMAIL_DOMAINS.has(parts[1]);
}
