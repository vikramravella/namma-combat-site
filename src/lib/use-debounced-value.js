'use client';
import { useEffect, useState } from 'react';

// Returns the input value, but only after it has been stable for `delay`
// milliseconds. Uses a single setTimeout per change with proper cleanup
// so quick successive updates don't pile up timers.
export function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
