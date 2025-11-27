import { useState, useRef, useEffect } from 'react';
import { IChatMessage } from '../interfaces/IChatBotService';
import { getChatBotService } from '../di/container';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBot = ({ isOpen, onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBotService = getChatBotService();

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, typingMessage]);

  useEffect(() => {
    if (isOpen) {
      // Modal açıldığında body scroll'unu engelle
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: IChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(false);
    setTypingMessage('');

    try {
      const result = await chatBotService.sendMessage({
        message: userMessage.content,
        conversationHistory: messages,
      });

      if (result.success && result.data) {
        // Yükleme animasyonunu kaldır, typing animasyonunu başlat
        setIsLoading(false);
        setIsTyping(true);
        // Mesajı yavaşça yükle (typing effect)
        await typeMessage(result.data);
      } else {
        setIsLoading(false);
        const errorMessage: IChatMessage = {
          role: 'assistant',
          content: result.error || 'Bir hata oluştu',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage: IChatMessage = {
        role: 'assistant',
        content: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTypingMessage('');
    }
  };

  const typeMessage = async (fullMessage: string): Promise<void> => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      const typingSpeed = 20; // Her karakter arası milisaniye

      const typingInterval = setInterval(() => {
        if (currentIndex < fullMessage.length) {
          setTypingMessage(fullMessage.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          const assistantMessage: IChatMessage = {
            role: 'assistant',
            content: fullMessage,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setTypingMessage('');
          resolve();
        }
      }, typingSpeed);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleOverlayClick}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="glass-strong rounded-2xl sm:rounded-3xl w-full max-w-2xl h-[80vh] max-h-[700px] shadow-glow-lg border border-indigo-500/20 animate-fade-in-up flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <img
                src="/gemini-color.svg"
                alt="Gemini"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                ChatBot
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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

          {/* Input */}
          <div className="p-4 sm:p-6 border-t border-indigo-500/20">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                disabled={isLoading}
                className="w-full sm:flex-1 glass rounded-xl p-3 sm:p-4 text-indigo-200 placeholder-indigo-400/50 border border-indigo-500/30 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Gönder'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dot-bounce {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-8px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }

        .animate-dot-1 {
          animation: dot-bounce 1.4s infinite;
        }

        .animate-dot-2 {
          animation: dot-bounce 1.4s infinite;
          animation-delay: 0.2s;
        }

        .animate-dot-3 {
          animation: dot-bounce 1.4s infinite;
          animation-delay: 0.4s;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </>
  );
};

