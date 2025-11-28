import { useState, useCallback } from 'react';

export interface UseTypingEffectReturn {
  typingMessage: string;
  startTyping: (fullMessage: string) => Promise<void>;
  reset: () => void;
}

export const useTypingEffect = (
  onComplete: (fullMessage: string) => void
): UseTypingEffectReturn => {
  const [typingMessage, setTypingMessage] = useState<string>('');

  const startTyping = useCallback(
    (fullMessage: string): Promise<void> => {
      return new Promise((resolve) => {
        let currentIndex = 0;
        const typingSpeed = 20;

        const typingInterval = setInterval(() => {
          if (currentIndex < fullMessage.length) {
            setTypingMessage(fullMessage.substring(0, currentIndex + 1));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            onComplete(fullMessage);
            setTypingMessage('');
            resolve();
          }
        }, typingSpeed);
      });
    },
    [onComplete]
  );

  const reset = useCallback((): void => {
    setTypingMessage('');
  }, []);

  return {
    typingMessage,
    startTyping,
    reset,
  };
};

