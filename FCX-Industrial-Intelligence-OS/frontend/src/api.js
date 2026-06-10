import { useCallback, useEffect, useRef, useState } from 'react';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function apiRequest(path, options = {}) {
  const { allowNotFound = false, fallback, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
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
