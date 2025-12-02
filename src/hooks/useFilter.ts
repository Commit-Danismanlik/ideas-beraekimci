import { useState, useCallback, useMemo } from 'react';

export interface UseFilterReturn<T> {
  filters: T;
  setFilters: (filters: T | ((prev: T) => T)) => void;
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  setInitialFilters: (filters: T) => void;
}

/**
 * useFilter Hook
 * Filtre state yönetimi için
 * SOLID: Single Responsibility - Sadece filtre state yönetiminden sorumlu
 */
export const useFilter = <T extends Record<string, unknown>>(
  initialFilters: T,
  isActiveCheck?: (filters: T) => boolean
): UseFilterReturn<T> => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback((): void => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const setInitialFilters = useCallback((newFilters: T): void => {
    setFilters(newFilters);
  }, []);

  const hasActiveFilters = useMemo((): boolean => {
    if (isActiveCheck) {
      return isActiveCheck(filters);
    }
    
    // Varsayılan kontrol: tüm değerlerin 'all' veya boş olup olmadığını kontrol et
    return Object.values(filters).some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.toLowerCase() === 'all') return false;
      if (typeof value === 'string' && value === '') return false;
      return true;
    });
  }, [filters, isActiveCheck]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    setInitialFilters,
  };
};

