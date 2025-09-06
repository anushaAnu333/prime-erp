import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/lib/api";

// Cache for hook data
const hookCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useOptimizedFetch = (endpoint, options = {}) => {
  const {
    dependencies = [],
    enabled = true,
    cacheKey = null,
    refetchInterval = null,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  // Generate cache key
  const getCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey;
    if (typeof endpoint === "function") {
      return endpoint.toString();
    }
    return endpoint;
  }, [endpoint, cacheKey]);

  // Check if data is cached and not expired
  const getCachedData = useCallback(() => {
    const key = getCacheKey();
    const cached = hookCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [getCacheKey]);

  // Set cached data
  const setCachedData = useCallback(
    (newData) => {
      const key = getCacheKey();
      hookCache.set(key, {
        data: newData,
        timestamp: Date.now(),
      });
    },
    [getCacheKey]
  );

  // Fetch data function
  const fetchData = useCallback(
    async (signal) => {
      if (!enabled) return;

      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLastFetched(Date.now());
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Abort previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        let response;
        if (typeof endpoint === "function") {
          response = await endpoint(
            signal || abortControllerRef.current.signal
          );
        } else {
          response = await apiClient.get(endpoint);
        }

        setData(response);
        setCachedData(response);
        setLastFetched(Date.now());
        setLoading(false);

        if (onSuccess) {
          onSuccess(response);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return; // Request was aborted, don't set error
        }

        console.error("Fetch error:", err);
        setError(err.message || "An error occurred while fetching data");
        setLoading(false);

        if (onError) {
          onError(err);
        }
      }
    },
    [endpoint, enabled, getCachedData, setCachedData, onSuccess, onError]
  );

  // Refetch function
  const refetch = useCallback(() => {
    const key = getCacheKey();
    hookCache.delete(key); // Clear cache for this endpoint
    fetchData();
  }, [fetchData, getCacheKey]);

  // Clear cache function
  const clearCache = useCallback(() => {
    const key = getCacheKey();
    hookCache.delete(key);
  }, [getCacheKey]);

  // Effect for initial fetch and dependencies
  useEffect(() => {
    fetchData();

    // Set up refetch interval if specified
    if (refetchInterval) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, refetchInterval);
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refetchInterval, refetch, ...dependencies]);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch,
    clearCache,
    isStale: lastFetched ? Date.now() - lastFetched > CACHE_DURATION : true,
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useOptimizedMutation = (mutationFn, options = {}) => {
  const { onSuccess = null, onError = null, invalidateQueries = [] } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(
    async (variables) => {
      setLoading(true);
      setError(null);

      try {
        const response = await mutationFn(variables);
        setData(response);
        setLoading(false);

        // Invalidate related queries
        invalidateQueries.forEach((queryKey) => {
          hookCache.delete(queryKey);
        });

        if (onSuccess) {
          onSuccess(response, variables);
        }

        return response;
      } catch (err) {
        console.error("Mutation error:", err);
        setError(err.message || "An error occurred");
        setLoading(false);

        if (onError) {
          onError(err, variables);
        }

        throw err;
      }
    },
    [mutationFn, onSuccess, onError, invalidateQueries]
  );

  return {
    mutate,
    loading,
    error,
    data,
  };
};

// Hook for real-time data with WebSocket support
export const useRealtimeData = (endpoint, options = {}) => {
  const { wsUrl = null, enabled = true, onMessage = null } = options;

  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    if (!enabled || !wsUrl) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData(message);
        if (onMessage) {
          onMessage(message);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [wsUrl, enabled, onMessage]);

  return {
    data,
    connected,
    send: (message) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
  };
};
