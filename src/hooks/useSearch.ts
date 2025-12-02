import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
  clearSearch: () => void;
}

/**
 * useSearch Hook
 * Arama query yönetimi için
 * SOLID: Single Responsibility - Sadece arama state yönetiminden sorumlu
 */
export const useSearch = (debounceDelay: number = 300): UseSearchReturn => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  const clearSearch = useCallback((): void => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    clearSearch,
  };
};

