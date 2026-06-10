import { useCallback, useEffect, useState } from 'react';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API respondeu com HTTP ${response.status}`);
  }

  return response.json();
}

export function useApiResource(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await apiRequest(path);
      setData(payload);
      setError('');
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError('Não foi possível carregar os dados. Verifique a conexão com a API.');
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
      setHealth({ ...payload, status: 'ok' });
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
