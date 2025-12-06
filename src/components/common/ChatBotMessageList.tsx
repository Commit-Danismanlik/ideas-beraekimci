import { useEffect, useRef } from 'react';
import { IChatMessage } from '../../interfaces/IChatBotService';
import { IMemberWithRole } from '../../services/TeamMemberInfoService';

interface ChatBotMessageListProps {
  messages: IChatMessage[];
  isTyping: boolean;
  typingMessage: string;
  isLoading: boolean;
  teamMembers: IMemberWithRole[];
}

export const ChatBotMessageList = ({
  messages,
  isTyping,
  typingMessage,
  isLoading,
  teamMembers,
}: ChatBotMessageListProps): JSX.Element => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottomRef = useRef<boolean>(false);
  const previousMessagesLengthRef = useRef<number>(0);

  const scrollToBottom = (): void => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Sohbet açıldığında (mesajlar ilk yüklendiğinde) sadece 1 kere en alta kaydır
  useEffect(() => {
    const currentMessagesLength = messages.length;
    const previousMessagesLength = previousMessagesLengthRef.current;

    // Eğer mesajlar boştan doluya geçtiyse veya conversation değiştiyse (mesaj sayısı sıfırlandı ve tekrar yüklendiyse)
    if (currentMessagesLength > 0 && previousMessagesLength === 0 && !hasScrolledToBottomRef.current) {
      // İlk yükleme - sohbet açıldığında sadece 1 kere en alta kaydır
      setTimeout(() => {
        scrollToBottom();
        hasScrolledToBottomRef.current = true;
      }, 100);
    }

    // Eğer mesajlar sıfırlandıysa (yeni conversation başlatıldı), scroll flag'ini sıfırla
    if (currentMessagesLength === 0 && previousMessagesLength > 0) {
      hasScrolledToBottomRef.current = false;
    }

    previousMessagesLengthRef.current = currentMessagesLength;
  }, [messages.length]);

  const getUserName = (userId?: string): string => {
    if (!userId) {
      return 'Kullanıcı';
    }
    const member = teamMembers.find((m) => m.userId === userId);
    return member?.displayName || member?.email || 'Kullanıcı';
  };

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.length === 0 && !isTyping && (
        <div className="text-center text-indigo-300/70 py-8">
          <p className="text-lg">Merhaba! Size nasıl yardımcı olabilirim?</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          {message.role === 'user' && message.userId && (
            <span className="text-xs text-indigo-300/70 mb-1 px-2">
              {getUserName(message.userId)}
            </span>
          )}
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

    </div>
  );
};

