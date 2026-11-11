// services/auth.service.ts

const API_BASE_URL = '/backend/auth';
const CSRF_TOKEN_PATH = '/backend/csrf-token';

let csrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(CSRF_TOKEN_PATH, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch CSRF token');
  }

  const data = await res.json() as { csrfToken: string };
  csrfToken = data.csrfToken;
  return csrfToken;
}

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('csrf_token='));

  return entry ? decodeURIComponent(entry.slice('csrf_token='.length)) : null;
}

export async function ensureCsrfToken(): Promise<string> {
  const cookieToken = readCsrfCookie();
  if (cookieToken) {
    csrfToken = cookieToken;
    return cookieToken;
  }

  if (csrfToken) {
    return csrfToken;
  }

  return fetchCsrfToken();
}

export async function getCsrfHeaders(
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const token = await ensureCsrfToken();
  return { ...extra, 'X-CSRF-Token': token };
}

export const authService = {
  async login(credentials: { email: string; password: string }) {
    await fetchCsrfToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken ?? '',
    };

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    return data;
  },

  async registerSuperAdmin(credentials: { full_name: string; email: string; password: string; secretKey: string }) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken ?? '',
    };

    const res = await fetch(`${API_BASE_URL}/register-super-admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Super Admin registration failed');
    }

    return data;
  },

  async registerManager(credentials: { full_name: string; email: string; password: string; branch_office?: string; secretKey: string }) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken ?? '',
    };

    const res = await fetch(`${API_BASE_URL}/register-manager`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Manager registration failed');
    }

    return data;
  },

  async getPendingRequests() {
    const res = await fetch(`${API_BASE_URL}/pending-requests`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch pending requests');
    }

    return data;
  },

  async logout() {
    const token = await ensureCsrfToken();

    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      csrfToken = null;
      localStorage.removeItem('user');
      window.location.replace('/protection/login');
    }
  },
};
