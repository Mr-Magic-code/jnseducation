import { ensureCsrfToken, fetchCsrfToken } from '@/services/auth.service';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function fetchWithCsrf(
  input: RequestInfo | URL,
  init: RequestInit,
  token: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('X-CSRF-Token', token);
  return fetch(input, { ...init, headers });
}

function isAuthRoute(input: RequestInfo | URL): boolean {
  const url = typeof input === 'string' ? input : input.toString();
  return url.includes('/auth/login') || url.includes('/auth/refresh');
}

async function refreshSession(): Promise<boolean> {
  try {
    const token = await ensureCsrfToken();
    const response = await fetch('/backend/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': token },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * fetch wrapper that:
 *  - attaches a signed CSRF token to state-changing requests,
 *  - refreshes an expired access token once and retries,
 *  - retries once with a fresh CSRF token if the token expired.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const stateChanging = STATE_CHANGING_METHODS.has(method);
  const skipRefresh = isAuthRoute(input);

  if (!stateChanging) {
    let response = await fetch(input, init);
    if (response.status === 401 && !skipRefresh) {
      if (await refreshSession()) {
        response = await fetch(input, init);
      }
    }
    return response;
  }

  let token = await ensureCsrfToken();
  let response = await fetchWithCsrf(input, init, token);

  if (response.status === 403) {
    const freshToken = await fetchCsrfToken();
    response = await fetchWithCsrf(input, init, freshToken);
  }

  if (response.status === 401 && !skipRefresh) {
    if (await refreshSession()) {
      token = await ensureCsrfToken();
      response = await fetchWithCsrf(input, init, token);
    }
  }

  return response;
}
