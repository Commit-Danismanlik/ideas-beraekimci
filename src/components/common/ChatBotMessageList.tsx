import { useEffect, useRef, useState } from 'react';
import { IChatMessage } from '../../interfaces/IChatBotService';

interface ChatBotMessageListProps {
  messages: IChatMessage[];
  isTyping: boolean;
  typingMessage: string;
  isLoading: boolean;
}

export const ChatBotMessageList = ({
  messages,
  isTyping,
  typingMessage,
  isLoading,
}: ChatBotMessageListProps): JSX.Element => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const previousMessagesLengthRef = useRef<number>(0);

  // Kullanıcının scroll pozisyonunu kontrol et
  const checkIfUserIsAtBottom = (): boolean => {
    if (!scrollContainerRef.current) {
      return false;
    }
    const container = scrollContainerRef.current;
    const threshold = 100; // 100px threshold - kullanıcı en alta yakınsa otomatik scroll yap
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    return isNearBottom;
  };

  // Scroll event handler - kullanıcı scroll yaptığında kontrol et
  const handleScroll = (): void => {
    if (scrollContainerRef.current) {
      const isAtBottom = checkIfUserIsAtBottom();
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Sadece yeni mesaj eklendiğinde ve kullanıcı en alttaysa scroll yap
  useEffect(() => {
    const currentMessagesLength = messages.length;
    const previousMessagesLength = previousMessagesLengthRef.current;

    // Yeni mesaj eklendi mi kontrol et
    if (currentMessagesLength > previousMessagesLength) {
      // Kullanıcı en alttaysa veya ilk mesajsa otomatik scroll yap
      if (shouldAutoScroll || currentMessagesLength === 1) {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      previousMessagesLengthRef.current = currentMessagesLength;
    }
  }, [messages.length, shouldAutoScroll]);

  // İlk yüklemede veya typing başladığında scroll kontrolü
  useEffect(() => {
    if (isTyping && shouldAutoScroll) {
      // Typing başladığında, eğer kullanıcı en alttaysa scroll yap
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [isTyping, shouldAutoScroll]);

  // Typing animasyonu sırasında (typingMessage değiştiğinde) scroll kontrolü
  // Sadece kullanıcı en alttaysa scroll yap
  useEffect(() => {
    if (isTyping && typingMessage && shouldAutoScroll) {
      // Kullanıcı en alttaysa, typingMessage değiştiğinde scroll'u güncelle
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  }, [typingMessage, isTyping, shouldAutoScroll]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
    >
      {messages.length === 0 && !isTyping && (
        <div className="text-center text-indigo-300/70 py-8">
          <p className="text-lg">Merhaba! Size nasıl yardımcı olabilirim?</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'glass text-indigo-200 border border-indigo-500/30'
            }`}
          >
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>
      ))}

      {isTyping && typingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 glass text-indigo-200 border border-indigo-500/30">
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
              {typingMessage}
              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse">|</span>
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 glass text-indigo-200 border border-indigo-500/30">
            <div className="flex gap-1 items-center">
              <span className="text-indigo-400 text-2xl font-bold animate-dot-1">.</span>
              <span className="text-indigo-400 text-2xl font-bold animate-dot-2">.</span>
              <span className="text-indigo-400 text-2xl font-bold animate-dot-3">.</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

