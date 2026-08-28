/** Normalize ENDPOINT_DOMAIN to a base URL without trailing slash. */
export function getAtenxionBaseUrl(): string | null {
  const raw = process.env.ENDPOINT_DOMAIN?.trim();
  if (!raw) return null;

  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `https://${withoutTrailingSlash}`;
}
