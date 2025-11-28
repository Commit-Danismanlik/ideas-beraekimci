import { useState, useCallback } from 'react';
import { IChatMessage } from '../interfaces/IChatBotService';

export interface UseChatBotReturn {
  messages: IChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  isTyping: boolean;
  typingMessage: string;
  setInputMessage: (message: string) => void;
  addMessage: (message: IChatMessage) => void;
  setTypingMessage: (message: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useChatBot = (): UseChatBotReturn => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingMessage, setTypingMessage] = useState<string>('');

  const addMessage = useCallback((message: IChatMessage): void => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    typingMessage,
    setInputMessage,
    addMessage,
    setTypingMessage,
    setIsTyping,
    setIsLoading,
  };
};

