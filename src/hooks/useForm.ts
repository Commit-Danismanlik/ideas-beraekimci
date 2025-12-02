import { useState, useCallback } from 'react';

export interface UseFormReturn<T> {
  formData: T;
  setFormData: (data: T | ((prev: T) => T)) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  reset: () => void;
  setInitialData: (data: T) => void;
}

/**
 * useForm Hook
 * Generic form state yönetimi için
 * SOLID: Single Responsibility - Sadece form state yönetiminden sorumlu
 */
export const useForm = <T extends Record<string, unknown>>(
  initialData: T
): UseFormReturn<T> => {
  const [formData, setFormData] = useState<T>(initialData);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const reset = useCallback((): void => {
    setFormData(initialData);
  }, [initialData]);

  const setInitialData = useCallback((data: T): void => {
    setFormData(data);
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    reset,
    setInitialData,
  };
};

