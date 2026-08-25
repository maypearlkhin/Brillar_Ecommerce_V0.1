const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

export class BackendApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
  }
}

type QueryValue = string | number | boolean | undefined;

interface BackendFetchOptions {
  token?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  params?: Record<string, QueryValue>;
}

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const normalizedBase = BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
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

export function requireAuthToken(token?: string): string {
  if (!token) {
    throw new BackendApiError('Please log in to use this feature.', 401);
  }
  return token;
}

export function toToolError(error: unknown) {
  if (error instanceof BackendApiError) {
    return {
      error: error.message,
      status: error.status,
      requiresLogin: error.status === 401,
    };
  }

  return {
    error: error instanceof Error ? error.message : 'Unexpected error',
    status: 500,
    requiresLogin: false,
  };
}
