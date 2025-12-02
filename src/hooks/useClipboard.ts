import { useState, useCallback } from 'react';

export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  isCopied: boolean;
  error: string | null;
}

/**
 * useClipboard Hook
 * Clipboard kopyalama işlemleri için
 * SOLID: Single Responsibility - Sadece clipboard işlemlerinden sorumlu
 */
export const useClipboard = (): UseClipboardReturn => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setError(null);
      
      // 2 saniye sonra isCopied'i false yap
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kopyalama başarısız oldu';
      setError(errorMessage);
      setIsCopied(false);
      return false;
    }
  }, []);

  return {
    copy,
    isCopied,
    error,
  };
};

