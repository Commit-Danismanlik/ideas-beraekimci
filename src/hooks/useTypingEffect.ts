import { useState, useCallback, useRef } from 'react';

export interface UseTypingEffectReturn {
  typingMessage: string;
  startTyping: (fullMessage: string) => Promise<void>;
  stop: () => string | null;
  reset: () => void;
}

export const useTypingEffect = (
  onComplete: (fullMessage: string) => void
): UseTypingEffectReturn => {
  const [typingMessage, setTypingMessage] = useState<string>('');
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fullMessageRef = useRef<string>('');

  const startTyping = useCallback(
    (fullMessage: string): Promise<void> => {
      return new Promise((resolve) => {
        // Önceki typing işlemini temizle
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }

        fullMessageRef.current = fullMessage;
        let currentIndex = 0;
        const typingSpeed = 20;

        typingIntervalRef.current = setInterval(() => {
          if (currentIndex < fullMessage.length) {
            setTypingMessage(fullMessage.substring(0, currentIndex + 1));
            currentIndex++;
          } else {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
            onComplete(fullMessage);
            setTypingMessage('');
            fullMessageRef.current = '';
            resolve();
          }
        }, typingSpeed);
      });
    },
    [onComplete]
  );

  const stop = useCallback((): string | null => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const currentMessage = typingMessage;
    if (currentMessage) {
      // Mevcut mesajı kaydet
      onComplete(currentMessage);
      setTypingMessage('');
      fullMessageRef.current = '';
      return currentMessage;
    }
    return null;
  }, [onComplete]);

  const reset = useCallback((): void => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setTypingMessage('');
    fullMessageRef.current = '';
  }, []);

  return {
    typingMessage,
    startTyping,
    stop,
    reset,
  };
};

