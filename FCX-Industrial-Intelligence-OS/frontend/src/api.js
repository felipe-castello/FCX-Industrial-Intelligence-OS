import { useCallback, useEffect, useRef, useState } from 'react';

export const API_URL = (import.meta.env.VITE_API_URL || 'https://api.nexusiotenergy.com.br').replace(/\/$/, '');
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== 'false';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const ACCESS_TOKEN_KEY = 'fcx.accessToken';
const REFRESH_TOKEN_KEY = 'fcx.refreshToken';
const USER_KEY = 'fcx.user';
let refreshPromise = null;

export const hasSession = () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY));
export const getSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.clear();
  window.dispatchEvent(new CustomEvent('fcx:session-cleared'));
};

export async function login(email, password) {
  const session = await apiRequest('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  return session;
}

export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  try {
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // Local logout must complete even when the API is unavailable.
  } finally {
    clearSession();
  }
}

export function withCompany(path, companyId) {
  if (!companyId) return path;
  return `${path}${path.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`;
}

export async function apiRequest(path, options = {}) {
  const { allowNotFound = false, fallback, ...fetchOptions } = options;
  const request = () => fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
      ...(AUTH_ENABLED && localStorage.getItem(ACCESS_TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}` } : {}),
      ...fetchOptions.headers,
    },
  });
  let response = await request();

  if (AUTH_ENABLED && response.status === 401 && !path.startsWith('/auth/')) {
    const renewed = await refreshSession();
    if (renewed) response = await request();
  }

  if (allowNotFound && response.status === 404) {
    return fallback;
  }

  if (!response.ok) {
    throw new Error(`API respondeu com HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return fallback;
  }

  return response.json();
}

async function refreshSession() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    clearSession();
    return false;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Refresh token rejected');
        const session = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
        return true;
      })
      .catch(() => {
        clearSession();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function normalizeResource(payload, fallback) {
  if (payload === null || payload === undefined) return fallback;
  if (Array.isArray(payload) && payload.length === 0) return fallback;
  if (!Array.isArray(payload) && typeof payload === 'object' && Object.keys(payload).length === 0) return fallback;
  return payload;
}

export function useApiResource(path, fallback) {
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await apiRequest(path, { allowNotFound: true, fallback: fallbackRef.current });
      setData(normalizeResource(payload, fallbackRef.current));
      setError('');
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError('Dados temporariamente indisponíveis. Tente atualizar novamente.');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, updatedAt, refresh };
}

export function useApiHealth() {
  const [health, setHealth] = useState({ status: 'checking', service: 'FCX API', timestamp: null });

  const check = useCallback(async () => {
    try {
      const payload = await apiRequest('/health');
      setHealth({ ...payload, status: payload?.status === 'ok' ? 'ok' : 'offline' });
    } catch (error) {
      setHealth({ status: 'offline', service: 'FCX API', timestamp: null });
    }
  }, []);

  useEffect(() => {
    check();
    const timer = window.setInterval(check, 30000);
    return () => window.clearInterval(timer);
  }, [check]);

  return { health, check };
}
