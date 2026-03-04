import { useState, useEffect } from 'react';

/************************************************************
 * useDebounce.ts
 * Vault - Custom hook for debounced value.
 * - Debounces a value (e.g., search/filter input) by delay ms.
 * - Returns the debounced value for efficient filtering and performance.
 * - Used in search, filter, and input components.
 ************************************************************/

/**
 * useDebounce
 * - Debounces a value by the specified delay.
 * - Updates debounced value only after delay ms have passed since last change.
 * @param value The value to debounce (any type)
 * @param delay Delay in milliseconds (default: 300)
 * @returns Debounced value
 */
export default function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up debounce timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timer on value or delay change
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}