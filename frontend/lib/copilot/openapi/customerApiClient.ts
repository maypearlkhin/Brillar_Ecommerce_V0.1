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
  /** Copilot tool name — included in dev console logs */
  toolName?: string;
}

const LOG_PREFIX = '[Copilot OpenAPI]';

export function logOpenApi(message: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') return;
  if (details) {
    console.log(LOG_PREFIX, message, details);
  } else {
    console.log(LOG_PREFIX, message);
  }
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
  const method = options.method ?? 'GET';
  const url = buildUrl(apiPath, options.params);

  logOpenApi('→ Request', {
    tool: options.toolName,
    method,
    url,
    params: options.params,
    body: options.body,
    requireAuth: options.requireAuth,
    authenticated: Boolean(options.token),
  });

  let token: string | undefined;
  try {
    token = options.requireAuth ? requireAuthToken(options.token) : options.token;
  } catch (error) {
    logOpenApi('← Auth required', {
      tool: options.toolName,
      method,
      url,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }

  const response = await fetch(url, {
    method,
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
    logOpenApi('← Invalid JSON', {
      tool: options.toolName,
      method,
      url,
      status: response.status,
    });
    throw new BackendApiError('Invalid response from backend API', response.status);
  }

  logOpenApi('← Response', {
    tool: options.toolName,
    method,
    url,
    status: response.status,
    body: payload,
  });

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
