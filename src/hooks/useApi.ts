import { useCallback, useEffect, useState } from "react";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiFetch = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("pp_token");
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getApiBase = () => apiBase;

export const useApi = <T,>(path: string, initial: T) => {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
