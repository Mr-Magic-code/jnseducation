// services/auth.service.ts

const API_BASE_URL = '/backend/auth';

export const authService = {
  /**
   * User login handle karta hai aur HttpOnly cookie browser mein set karwata hai
   */
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    return data;
  },

  /**
   * Super Admin registration (/flash-admin ke liye)
   */
  async registerSuperAdmin(credentials: { full_name: string; email: string; password: string; secretKey: string }) {
    const res = await fetch(`${API_BASE_URL}/register-super-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Super Admin registration failed');
    }

    return data;
  },

  /**
   * Manager registration (/admin ke liye) - branch_office aur secretKey added here
   */
  async registerManager(credentials: { full_name: string; email: string; password: string; branch_office?: string; secretKey: string }) {
    const res = await fetch(`${API_BASE_URL}/register-manager`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Manager registration failed');
    }

    return data;
  },

  /**
   * Pending manager requests fetch karne ke liye (Super Admin dashboard)
   */
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

  /**
   * Backend ko logout request bhej kar cookie destroy karta hai aur user ko login page par bhejta hai
   */
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('user');
      window.location.replace('/protection/login');
    }
  },
};