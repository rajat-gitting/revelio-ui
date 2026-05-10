import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiRequestError } from '@/api/client';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Runs `fetcher` on mount and whenever `watch` changes (by reference / value in the dependency list).
 * Use `watch` when a parent value should trigger a reload (e.g. an id). Omit for one-shot load on mount.
 */
export function useApi<T>(fetcher: () => Promise<T>, watch?: unknown): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(() => {
    const version = ++versionRef.current;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const result = await fetcherRef.current();
        if (version === versionRef.current) {
          setData(result);
        }
      } catch (err: unknown) {
        if (version === versionRef.current) {
          const message = err instanceof ApiRequestError ? err.message : 'Something went wrong';
          setError(message);
        }
      } finally {
        if (version === versionRef.current) {
          setLoading(false);
        }
      }
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load, watch]);

  return { data, loading, error, refetch: load };
}
