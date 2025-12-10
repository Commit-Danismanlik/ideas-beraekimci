import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IChatMessage } from '../../interfaces/IChatBotService';
import { IMemberWithRole } from '../../services/TeamMemberInfoService';

interface ChatBotMessageListProps {
  messages: IChatMessage[];
  isTyping: boolean;
  typingMessage: string;
  isLoading: boolean;
  teamMembers: IMemberWithRole[];
  conversationId?: string | null; // Conversation değişikliğini algılamak için
}

export const ChatBotMessageList = ({
  messages,
  isTyping,
  typingMessage,
  isLoading,
  teamMembers,
  conversationId,
}: ChatBotMessageListProps): JSX.Element => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);
  const previousMessagesLengthRef = useRef<number>(0);
  const previousConversationIdRef = useRef<string | null | undefined>(undefined);

  const scrollToBottom = (smooth: boolean = false): void => {
    if (scrollContainerRef.current) {
      if (smooth) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  };

  // Kullanıcı scroll yaptığında kontrol et
  const handleScroll = (): void => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    // Kullanıcı yukarı scroll yaptıysa otomatik scroll'u durdur
    if (!isNearBottom) {
      shouldAutoScrollRef.current = false;
    } else {
      // Kullanıcı tekrar en alta geldiyse otomatik scroll'u aktif et
      shouldAutoScrollRef.current = true;
    }
  };

  // Conversation değiştiğinde otomatik scroll yap
  useEffect(() => {
    const currentConversationId = conversationId;
    const previousConversationId = previousConversationIdRef.current;
    const currentMessagesLength = messages.length;
    const previousMessagesLength = previousMessagesLengthRef.current;

    // Conversation ID değiştiyse (yeni conversation açıldı)
    const conversationChanged = 
      previousConversationId !== undefined && 
      currentConversationId !== previousConversationId;

    // Yeni conversation açıldığında veya mesajlar boştan doluya geçtiğinde
    if ((conversationChanged || (currentMessagesLength > 0 && previousMessagesLength === 0)) && shouldAutoScrollRef.current) {
      // Sohbet açıldığında en alta kaydır
      setTimeout(() => {
        scrollToBottom(false);
        shouldAutoScrollRef.current = true;
      }, 150);
    }

    // Mesajlar sıfırlandıysa (yeni conversation başlatıldı)
    if (currentMessagesLength === 0 && previousMessagesLength > 0) {
      shouldAutoScrollRef.current = true;
    }

    previousMessagesLengthRef.current = currentMessagesLength;
    previousConversationIdRef.current = currentConversationId;
  }, [conversationId, messages.length]);

  // Yeni mesaj eklendiğinde veya typing durumu değiştiğinde otomatik scroll yap (kullanıcı scroll yapmıyorsa)
  useEffect(() => {
    if (shouldAutoScrollRef.current && (messages.length > 0 || isTyping || isLoading)) {
      // Kısa bir gecikme ile scroll yap (DOM güncellemesi için)
      const timeoutId = setTimeout(() => {
        if (shouldAutoScrollRef.current) {
          scrollToBottom(true);
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, isTyping, isLoading, typingMessage]);

  const getUserName = (userId?: string): string => {
    if (!userId) {
      return 'Kullanıcı';
    }
    const member = teamMembers.find((m) => m.userId === userId);
    return member?.displayName || member?.email || 'Kullanıcı';
  };

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
            {message.role === 'assistant' ? (
              <div className="text-sm sm:text-base prose prose-invert prose-indigo max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-indigo-100">{children}</strong>,
                    em: ({ children }) => <em className="italic text-indigo-200">{children}</em>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-indigo-900/50 px-1.5 py-0.5 rounded text-indigo-200 text-sm">{children}</code>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-indigo-900/50 p-3 rounded-lg overflow-x-auto mb-2 text-sm">
                        {children}
                      </pre>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-2 -mx-2">
                        <table className="min-w-full border-collapse border border-indigo-500/30 my-2">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-indigo-900/50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-indigo-500/20">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="border-b border-indigo-500/20">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="border border-indigo-500/30 px-3 py-2 text-left font-bold text-indigo-100 text-sm">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-indigo-500/30 px-3 py-2 text-indigo-200 text-sm">
                        {children}
                      </td>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3 text-indigo-100">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 text-indigo-100">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2 text-indigo-100">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-3 italic my-2 text-indigo-300">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        </div>
      ))}

      {isTyping && typingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 glass text-indigo-200 border border-indigo-500/30">
            <div className="text-sm sm:text-base prose prose-invert prose-indigo max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-indigo-100">{children}</strong>,
                  em: ({ children }) => <em className="italic text-indigo-200">{children}</em>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-indigo-900/50 px-1.5 py-0.5 rounded text-indigo-200 text-sm">{children}</code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-indigo-900/50 p-3 rounded-lg overflow-x-auto mb-2 text-sm">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-2 -mx-2">
                      <table className="min-w-full border-collapse border border-indigo-500/30 my-2">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-indigo-900/50">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-indigo-500/20">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="border-b border-indigo-500/20">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="border border-indigo-500/30 px-3 py-2 text-left font-bold text-indigo-100 text-sm">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-indigo-500/30 px-3 py-2 text-indigo-200 text-sm">
                      {children}
                    </td>
                  ),
                }}
              >
                {typingMessage}
              </ReactMarkdown>
              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse">|</span>
            </div>
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

