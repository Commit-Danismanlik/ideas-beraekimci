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
  const currentIndexRef = useRef<number>(0);

  const startTyping = useCallback(
    (fullMessage: string): Promise<void> => {
      return new Promise((resolve) => {
        // Önceki typing işlemini temizle
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }

        fullMessageRef.current = fullMessage;
        currentIndexRef.current = 0;
        const typingSpeed = 20;

        typingIntervalRef.current = setInterval(() => {
          if (currentIndexRef.current < fullMessage.length) {
            const newMessage = fullMessage.substring(0, currentIndexRef.current + 1);
            setTypingMessage(newMessage);
            currentIndexRef.current++;
          } else {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
            onComplete(fullMessage);
            setTypingMessage('');
            fullMessageRef.current = '';
            currentIndexRef.current = 0;
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

    // currentIndexRef kullanarak o anki mesajı al (daha güvenilir)
    const currentMessage = fullMessageRef.current.substring(0, currentIndexRef.current);
    if (currentMessage && currentMessage.length > 0) {
      // Mevcut yarım mesajı kaydet
      onComplete(currentMessage);
      setTypingMessage('');
      fullMessageRef.current = '';
      currentIndexRef.current = 0;
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

