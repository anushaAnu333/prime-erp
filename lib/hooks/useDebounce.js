import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * @param {Function} func - The function to throttle
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The throttled function
 */
export function useThrottle(func, delay) {
  const [lastCall, setLastCall] = useState(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      setLastCall(now);
      return func(...args);
    }
  }, [func, delay, lastCall]);
}
