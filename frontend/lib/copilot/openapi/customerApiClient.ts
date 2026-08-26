import { BackendApiError, toToolError } from '../tools/backendClient';

const BASE_URL = (
  process.env.BACKEND_BASE_URL ||
  process.env.BACKEND_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000'
).replace(/\/$/, '');

type QueryValue = string | number | boolean | undefined;

export interface CustomerFetchOptions {
  token?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  params?: Record<string, QueryValue>;
  requireAuth?: boolean;
}

function buildUrl(apiPath: string, params?: Record<string, QueryValue>): string {
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const url = new URL(`${BASE_URL}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export function requireAuthToken(token?: string): string {
  if (!token) {
    throw new BackendApiError('Please log in to use this feature.', 401);
  }
  return token;
}

export async function customerFetch<T>(
  apiPath: string,
  options: CustomerFetchOptions = {},
): Promise<T> {
  const token = options.requireAuth ? requireAuthToken(options.token) : options.token;

  const response = await fetch(buildUrl(apiPath, options.params), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  let payload: { success?: boolean; message?: string; data?: T } = {};
  try {
    payload = await response.json();
  } catch {
    throw new BackendApiError('Invalid response from backend API', response.status);
  }

  if (!response.ok || payload.success === false) {
    throw new BackendApiError(payload.message || 'Backend API request failed', response.status);
  }

  return payload.data as T;
}

export { toToolError };

export function isAuthRequired(security?: Record<string, unknown>[]): boolean {
  if (!security?.length) return false;
  const hasBearer = security.some((entry) => entry && 'bearerAuth' in entry);
  const allowsAnonymous = security.some((entry) => entry && Object.keys(entry).length === 0);
  return hasBearer && !allowsAnonymous;
}

export function substitutePathParams(
  path: string,
  pathValues: Record<string, string | number>,
): string {
  let result = path;
  for (const [key, value] of Object.entries(pathValues)) {
    result = result.replace(`{${key}}`, encodeURIComponent(String(value)));
  }
  return result;
}
