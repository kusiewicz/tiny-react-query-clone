import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "./react-query-provider";

interface FetchOptions {
  cacheTime?: number;
  dedupingInterval?: number;
  retryCount?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
}

const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_DEDUPING_INTERVAL = 2000; // 2 seconds

/**
 * Custom hook for fetching data with cache, deduplication, and retry logic.
 *
 * @template T Type of the data being fetched.
 * @param {string} url The URL to fetch data from.
 * @param {string} queryKey Unique key to identify the data in the cache.
 * @param {FetchOptions} [options={}] Optional settings to configure fetch behavior.
 * @returns {FetchState<T> & {
 *   refetch: () => Promise<void>;
 *   mutate: (data: T | ((prev: T | null) => T)) => void;
 * }} Returns fetch state (data, error, loading flags) plus `refetch` and `mutate` methods.
 */
export function useReactQuery<T>(
  url: string,
  queryKey: string,
  options: FetchOptions = {}
): FetchState<T> & {
  refetch: () => Promise<void>;
  mutate: (data: T | ((prev: T | null) => T)) => void;
} {
  const client = useQueryClient();

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isValidating: false,
  });

  const {
    cacheTime = DEFAULT_CACHE_TIME,
    dedupingInterval = DEFAULT_DEDUPING_INTERVAL,
    enabled = true,
    retryCount = 2,
    retryDelay = 2000,
    onError,
  } = options;

  const setLoadingState = (dataExists: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: !dataExists,
      isValidating: dataExists,
    }));
  };

  const handleCacheHit = useCallback((cachedData: T) => {
    setState({
      data: cachedData,
      error: null,
      isLoading: false,
      isValidating: true,
    });
  }, []);

  const handlePending = useCallback(
    async (pending: Promise<T>) => {
      try {
        const data = await pending;
        setState({ data, error: null, isLoading: false, isValidating: false });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
          isValidating: false,
        }));
        onError?.(error as Error);
      }
    },
    [onError]
  );

  const fetchAndStoreData = useCallback(
    async (attempt: number = 0) => {
      const fetchPromise = fetch(url)
        .then((res) => {
          if (!res.ok)
            throw new Error(`Error fetching data: ${res.statusText}`);
          return res.json();
        })
        .then((data: T) => {
          client.setCache(queryKey, data, cacheTime);
          return data;
        });

      client.setPending(queryKey, fetchPromise, dedupingInterval);

      try {
        const data = await fetchPromise;
        setState({ data, error: null, isLoading: false, isValidating: false });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
          isValidating: false,
        }));

        onError?.(error as Error);

        if (attempt <= retryCount) {
          setTimeout(() => {
            fetchAndStoreData(attempt + 1);
          }, retryDelay);
        }
      } finally {
        client.removePending(queryKey);
      }
    },
    [
      url,
      client,
      queryKey,
      cacheTime,
      onError,
      dedupingInterval,
      retryCount,
      retryDelay,
    ]
  );

  const fetchData = useCallback(async () => {
    const cachedData = client.getCache<T>(queryKey);
    if (cachedData) {
      handleCacheHit(cachedData);
      return;
    }

    const pending = client.getPending<T>(queryKey);
    if (pending) {
      await handlePending(pending);
      return;
    }

    setLoadingState(true);
    await fetchAndStoreData();
  }, [client, queryKey, fetchAndStoreData, handleCacheHit, handlePending]);

  const refetch = useCallback(async () => {
    client.removeCache(queryKey);
    await fetchData();
  }, [client, queryKey, fetchData]);

  const mutate = useCallback(
    (newData: T | ((current: T | null) => T)) => {
      setState((prev) => {
        const updated =
          typeof newData === "function"
            ? (newData as (current: T | null) => T)(prev.data)
            : newData;

        client.setCache(queryKey, updated, cacheTime);

        return { ...prev, data: updated };
      });
    },
    [client, queryKey, cacheTime]
  );

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return {
    ...state,
    refetch,
    mutate,
  };
}
