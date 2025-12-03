import { useCallback, useEffect } from 'react';
import { IChatMessage } from '../../interfaces/IChatBotService';
import { getChatBotService } from '../../di/container';
import { useChatBot } from '../../hooks/useChatBot';
import { useTypingEffect } from '../../hooks/useTypingEffect';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { ChatBotOverlay } from '../common/ChatBotOverlay';
import { ChatBotHeader } from '../common/ChatBotHeader';
import { ChatBotMessageList } from '../common/ChatBotMessageList';
import { ChatBotMessageInput } from '../common/ChatBotMessageInput';
import { ChatBotAnimations } from '../common/ChatBotAnimations';
import { ChatBotMaintenanceModal } from '../common/ChatBotMaintenanceModal';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

// Bakım modu kontrolü - environment variable veya config ile kontrol edilebilir
const isMaintenanceMode = (): boolean => {
  const maintenanceFlag = import.meta.env.VITE_CHATBOT_MAINTENANCE_MODE;
  // Eğer 'false' olarak açıkça set edilmemişse bakım modu aktif
  return maintenanceFlag !== 'false';
};

export const ChatBot = ({ isOpen, onClose }: ChatBotProps): JSX.Element | null => {
  // Bakım modu aktifse sadece bakım modalını göster
  if (isMaintenanceMode()) {
    return <ChatBotMaintenanceModal isOpen={isOpen} onClose={onClose} />;
  }
  const chatBotService = getChatBotService();
  const {
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
  } = useChatBot();

  const handleTypingComplete = useCallback(
    (fullMessage: string): void => {
      const assistantMessage: IChatMessage = {
        role: 'assistant',
        content: fullMessage,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    },
    [addMessage]
  );

  const { typingMessage: typingEffectMessage, startTyping } = useTypingEffect(handleTypingComplete);

  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage: IChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
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
        setIsLoading(false);
        setIsTyping(true);
        await startTyping(result.data);
      } else {
        setIsLoading(false);
        const errorMessage: IChatMessage = {
          role: 'assistant',
          content: result.error || 'Bir hata oluştu',
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage: IChatMessage = {
        role: 'assistant',
        content: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsTyping(false);
      setTypingMessage('');
    }
  }, [
    inputMessage,
    isLoading,
    messages,
    chatBotService,
    addMessage,
    setInputMessage,
    setIsLoading,
    setIsTyping,
    setTypingMessage,
    startTyping,
  ]);

  useEffect(() => {
    setTypingMessage(typingEffectMessage);
  }, [typingEffectMessage, setTypingMessage]);

  useBodyScrollLock(isOpen);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <ChatBotOverlay onClose={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="glass-strong rounded-2xl sm:rounded-3xl w-full max-w-2xl h-[80vh] max-h-[700px] shadow-glow-lg border border-indigo-500/20 animate-fade-in-up flex flex-col pointer-events-auto">
          <ChatBotHeader onClose={onClose} />

          <ChatBotMessageList
            messages={messages}
            isTyping={isTyping}
            typingMessage={typingMessage}
            isLoading={isLoading}
          />

          <ChatBotMessageInput
            inputMessage={inputMessage}
            isLoading={isLoading}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      <ChatBotAnimations />
    </>
  );
};

