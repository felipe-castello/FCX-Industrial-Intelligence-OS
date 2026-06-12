import { useCallback, useEffect, useRef, useState } from 'react';

export const API_URL = (import.meta.env.VITE_API_URL || 'https://api.nexusiotenergy.com.br').replace(/\/$/, '');
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const ACCESS_TOKEN_KEY = 'fcx.accessToken';
const REFRESH_TOKEN_KEY = 'fcx.refreshToken';

export const hasSession = () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export async function login(email, password) {
  const session = await apiRequest('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  return session;
}

export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (refreshToken) await apiRequest('/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) }).catch(() => undefined);
  clearSession();
}

export function withCompany(path, companyId) {
  if (!companyId) return path;
  return `${path}${path.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`;
}

export async function apiRequest(path, options = {}) {
  const { allowNotFound = false, fallback, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
      ...(AUTH_ENABLED && localStorage.getItem(ACCESS_TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}` } : {}),
      ...fetchOptions.headers,
    },
  });

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
