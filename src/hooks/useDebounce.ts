import { useEffect, useRef, useState } from 'react';

export const useDebounce = (value: string, delayMs: number): string => {
  const [debounced, setDebounced] = useState<string>(value);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setDebounced(value), delayMs);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [value, delayMs]);

  return debounced;
};


