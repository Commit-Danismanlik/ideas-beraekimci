import { useCallback, useEffect, useState, useRef } from 'react';
import { IChatMessage } from '../../interfaces/IChatBotService';
import { getChatBotService, getTeamService, getTeamMemberInfoService } from '../../di/container';
import { useChatBot } from '../../hooks/useChatBot';
import { useTypingEffect } from '../../hooks/useTypingEffect';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useAuthContext } from '../../contexts/AuthContext';
import { useChatConversations } from '../../hooks/useChatConversations';
import { ChatBotOverlay } from '../common/ChatBotOverlay';
import { ChatBotHeader } from '../common/ChatBotHeader';
import { ChatBotMessageList } from '../common/ChatBotMessageList';
import { ChatBotMessageInput } from '../common/ChatBotMessageInput';
import { ChatBotAnimations } from '../common/ChatBotAnimations';
import { ChatBotMaintenanceModal } from '../common/ChatBotMaintenanceModal';
import { ChatHistorySidebar } from '../common/ChatHistorySidebar';
import { IChatConversation } from '../../models/ChatConversation.model';
import { generateChatTitle } from '../../utils/chatTitleGenerator';
import { IMemberWithRole } from '../../services/TeamMemberInfoService';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  hasTeam: boolean;
  selectedTeamId: string | null;
}

// Bakım modu kontrolü - environment variable veya config ile kontrol edilebilir
const isMaintenanceMode = (): boolean => {
  return false;
};

export const ChatBot = ({ isOpen, onClose, hasTeam, selectedTeamId }: ChatBotProps): JSX.Element | null => {
  const { user } = useAuthContext();
  const [currentConversation, setCurrentConversation] = useState<IChatConversation | null>(null);
  const [teamMembers, setTeamMembers] = useState<IMemberWithRole[]>([]);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const { updateConversation: updateConversationInList, createConversation: createConversationInList } = useChatConversations();
  const messagesRef = useRef<IChatMessage[]>([]);

  const chatBotService = getChatBotService();
  const teamService = getTeamService();
  const memberInfoService = getTeamMemberInfoService();

  const {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    typingMessage,
    setInputMessage,
    addMessage,
    setMessages,
    setTypingMessage,
    setIsTyping,
    setIsLoading,
  } = useChatBot();

  // API key kontrolü
  useEffect(() => {
    const checkApiKey = async (): Promise<void> => {
      if (!selectedTeamId || !isOpen || !hasTeam) {
        setApiKeyConfigured(null);
        return;
      }

      try {
        const teamResult = await teamService.getTeamById(selectedTeamId);
        if (teamResult.success && teamResult.data) {
          const hasApiKey = !!(teamResult.data.geminiApiKey && teamResult.data.geminiApiKey.trim() !== '');
          setApiKeyConfigured(hasApiKey);
        } else {
          setApiKeyConfigured(false);
        }
      } catch (error) {
        // console.error('API key kontrolü başarısız:', error);
        setApiKeyConfigured(false);
      }
    };

    if (isOpen && selectedTeamId && hasTeam) {
      checkApiKey();
    }
  }, [isOpen, selectedTeamId, hasTeam, teamService]);

  // Takım üyelerini yükle
  useEffect(() => {
    const loadTeamMembers = async (): Promise<void> => {
      if (!selectedTeamId || !hasTeam) {
        setTeamMembers([]);
        return;
      }

      try {
        const memberIds = await teamService.getTeamMembers(selectedTeamId);
        if (memberIds.length > 0) {
          const members = await memberInfoService.getMembersWithInfo(selectedTeamId, memberIds);
          setTeamMembers(members);
        } else {
          setTeamMembers([]);
        }
      } catch (error) {
        // console.error('Takım üyeleri yüklenemedi:', error);
        setTeamMembers([]);
      }
    };

    if (hasTeam && selectedTeamId) {
      loadTeamMembers();
    }
  }, [selectedTeamId, hasTeam, teamService, memberInfoService]);

  // messages değiştiğinde ref'i güncelle
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Modal açıldığında ve conversation varsa mesajları yükle
  useEffect(() => {
    if (isOpen && currentConversation) {
      setMessages(currentConversation.messages);
      messagesRef.current = currentConversation.messages;
    }
  }, [isOpen, currentConversation, setMessages]);

  // Conversation'ı kaydet veya güncelle
  const saveConversation = useCallback(
    async (allMessages: IChatMessage[]): Promise<void> => {
      if (!selectedTeamId || !user || allMessages.length === 0) {
        // console.log('saveConversation: Eksik parametreler, conversation kaydedilmedi', {
        //   selectedTeamId,
        //   hasUser: !!user,
        //   messageCount: allMessages.length,
        // });
        return;
      }

      const firstUserMessage = allMessages.find((msg) => msg.role === 'user');
      if (!firstUserMessage) {
        // console.log('saveConversation: User mesajı bulunamadı, conversation kaydedilmedi');
        return;
      }

      // Sadece user mesajı varsa (assistant yanıtı yoksa) conversation oluşturma
      // Bu sayede 2 ayrı conversation oluşması engellenecek
      const hasAssistantMessage = allMessages.some((msg) => msg.role === 'assistant');
      if (!hasAssistantMessage && !currentConversation) {
        // console.log('saveConversation: Sadece user mesajı var, assistant yanıtı bekleniyor. Conversation oluşturulmadı.');
        return;
      }

      const title = generateChatTitle(firstUserMessage.content);

      // User mesajlarına userId ekle
      const messagesWithUserId = allMessages.map((msg) => {
        if (msg.role === 'user' && !msg.userId) {
          return { ...msg, userId: user.uid };
        }
        return msg;
      });

      if (currentConversation) {
        // Mevcut conversation'ı güncelle
        // console.log('saveConversation: Mevcut conversation güncelleniyor...', {
        //   conversationId: currentConversation.id,
        //   messageCount: messagesWithUserId.length,
        // });
        const result = await updateConversationInList(selectedTeamId, currentConversation.id, { messages: messagesWithUserId });
        if (result.success && result.data) {
          // console.log('saveConversation: Conversation başarıyla güncellendi', {
          //   conversationId: result.data.id,
          //   title: result.data.title,
          // });
          setCurrentConversation(result.data);
          setSidebarRefreshKey((prev) => prev + 1);
        } else {
          // console.error('saveConversation: Conversation güncellenemedi', result.error);
        }
      } else {
        // Yeni conversation oluştur (sadece assistant mesajı varsa)
        // console.log('saveConversation: Yeni conversation oluşturuluyor...', {
        //   title,
        //   messageCount: messagesWithUserId.length,
        // });
        const result = await createConversationInList(selectedTeamId, user.uid, {
          title,
          messages: messagesWithUserId,
        });
        if (result.success && result.data) {
          // console.log('saveConversation: Conversation başarıyla oluşturuldu', {
          //   conversationId: result.data.id,
          //   title: result.data.title,
          // });
          setCurrentConversation(result.data);
          setSidebarRefreshKey((prev) => prev + 1);
        } else {
          // console.error('saveConversation: Conversation oluşturulamadı', result.error);
        }
      }
    },
    [selectedTeamId, user, currentConversation, updateConversationInList, createConversationInList]
  );

  const handleTypingComplete = useCallback(
    async (fullMessage: string): Promise<void> => {
      const assistantMessage: IChatMessage = {
        role: 'assistant',
        content: fullMessage,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
      
      // Typing tamamlandığında conversation'ı kaydet
      if (selectedTeamId && user) {
        // Ref'ten güncel mesajları al (state güncellemesi henüz tamamlanmamış olabilir)
        const allMessages = [...messagesRef.current, assistantMessage];
        await saveConversation(allMessages);
      }
    },
    [addMessage, selectedTeamId, user, saveConversation]
  );

  const { typingMessage: typingEffectMessage, startTyping, stop: stopTyping } = useTypingEffect(handleTypingComplete);

  // Conversation seçildiğinde mesajları yükle
  const handleSelectConversation = useCallback(
    (conversation: IChatConversation | null): void => {
      if (conversation) {
        setCurrentConversation(conversation);
        setMessages(conversation.messages);
        messagesRef.current = conversation.messages;
      } else {
        setCurrentConversation(null);
        setMessages([]);
        messagesRef.current = [];
      }
      // Mobilde conversation seçildiğinde sidebar'ı kapat
      setIsSidebarOpen(false);
    },
    [setMessages]
  );

  // Yeni conversation başlat
  const handleNewConversation = useCallback((): void => {
    setCurrentConversation(null);
    setMessages([]);
    setInputMessage('');
    messagesRef.current = [];
    // Mobilde yeni conversation başlatıldığında sidebar'ı kapat
    setIsSidebarOpen(false);
  }, [setMessages, setInputMessage]);

  // Sidebar toggle (mobil için)
  const handleToggleSidebar = useCallback((): void => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Modal açıldığında sidebar'ı kapat
  useEffect(() => {
    if (isOpen) {
      setIsSidebarOpen(false);
    }
  }, [isOpen]);

  // Conversation güncellendiğinde veya silindiğinde sidebar'ı yenile
  const handleConversationUpdated = useCallback((): void => {
    setSidebarRefreshKey((prev) => prev + 1);
  }, []);

  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading || !selectedTeamId || !user) {
      return;
    }

    const userMessage: IChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      userId: user.uid,
    };

    const updatedMessages = [...messages, userMessage];
    addMessage(userMessage);
    setInputMessage('');
    
    // Conversation kaydetmeyi kaldırdık - sadece assistant yanıtı geldiğinde kaydedilecek
    // Bu sayede 2 ayrı conversation oluşması engellenecek
    
    setIsLoading(true);
    setIsTyping(false);
    setTypingMessage('');

    try {
      const result = await chatBotService.sendMessage({
        message: userMessage.content,
        teamId: selectedTeamId || undefined,
        conversationHistory: messages,
      });

      if (result.success && result.data) {
        setIsLoading(false);
        setIsTyping(true);
        await startTyping(result.data);
        // Conversation kaydetme handleTypingComplete içinde yapılacak
      } else {
        setIsLoading(false);
        const errorMessage: IChatMessage = {
          role: 'assistant',
          content: result.error || 'Bir hata oluştu',
          timestamp: new Date(),
        };
        addMessage(errorMessage);
        // Hata durumunda da conversation'ı kaydet (user mesajı + error mesajı)
        const allMessagesWithError = [...updatedMessages, errorMessage];
        await saveConversation(allMessagesWithError);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage: IChatMessage = {
        role: 'assistant',
        content: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      // Hata durumunda da conversation'ı kaydet (user mesajı + error mesajı)
      const allMessagesWithError = [...updatedMessages, errorMessage];
      await saveConversation(allMessagesWithError);
    } finally {
      setIsTyping(false);
      setTypingMessage('');
    }
  }, [
    inputMessage,
    isLoading,
    messages,
    selectedTeamId,
    user,
    chatBotService,
    addMessage,
    setInputMessage,
    setIsLoading,
    setIsTyping,
    setTypingMessage,
    startTyping,
    saveConversation,
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

  const handleStopTyping = useCallback((): void => {
    // Typing animasyonunu durdur - bu handleTypingComplete'i çağıracak ve yarım mesajı kaydedecek
    stopTyping();
    
    // State'leri temizle - input'u aktif hale getir
    setIsTyping(false);
    setTypingMessage('');
    setIsLoading(false);
    
    // Mesaj handleTypingComplete içinde kaydedilecek
    // stopTyping() zaten onComplete callback'ini çağırdı, bu da handleTypingComplete'i tetikledi
    // handleTypingComplete içinde yarım mesaj kaydedilecek
  }, [stopTyping, setIsTyping, setTypingMessage, setIsLoading]);

  // Koşullu render - tüm hook'lar çağrıldıktan sonra
  if (!isOpen) {
    return null;
  }

  // Kullanıcı takımda değilse takım gerekli modalını göster
  if (!hasTeam) {
    return <ChatBotMaintenanceModal isOpen={isOpen} onClose={onClose} requiresTeam={true} />;
  }

  // Bakım modu aktifse sadece bakım modalını göster
  if (isMaintenanceMode()) {
    return <ChatBotMaintenanceModal isOpen={isOpen} onClose={onClose} />;
  }

  // API key yoksa modal göster
  if (selectedTeamId && apiKeyConfigured === false) {
    return <ChatBotMaintenanceModal isOpen={isOpen} onClose={onClose} requiresApiKey={true} />;
  }

  return (
    <>
      <ChatBotOverlay onClose={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        {/* Tek Modal - Sol tarafta sidebar, sağ tarafta chat */}
        <div className="glass-strong rounded-2xl sm:rounded-3xl w-full max-w-6xl h-[85vh] max-h-[800px] shadow-glow-lg border border-indigo-500/20 animate-fade-in-up flex pointer-events-auto overflow-hidden relative">
          {/* Sidebar - Sol taraf */}
          {/* Desktop'ta her zaman görünür, mobilde toggle ile açılır/kapanır */}
          {hasTeam && selectedTeamId && (
            <>
              {/* Mobilde sidebar overlay */}
              {isSidebarOpen && (
                <div
                  className="md:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              {/* Sidebar */}
              <div
                className={`
                  absolute md:relative
                  top-0 left-0 h-full
                  w-80 border-r border-indigo-500/20 flex-shrink-0
                  bg-slate-900/95 md:bg-transparent
                  z-50 md:z-auto
                  transform transition-transform duration-300 ease-in-out
                  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
              >
                <ChatHistorySidebar
                  teamId={selectedTeamId}
                  selectedConversationId={currentConversation?.id || null}
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                  refreshKey={sidebarRefreshKey}
                  onConversationUpdated={handleConversationUpdated}
                />
              </div>
            </>
          )}

          {/* Main Chat - Sağ taraf */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatBotHeader
              onClose={onClose}
              onToggleSidebar={hasTeam && selectedTeamId ? handleToggleSidebar : undefined}
              isSidebarOpen={isSidebarOpen}
            />

            <ChatBotMessageList
              messages={messages}
              isTyping={isTyping}
              typingMessage={typingMessage}
              isLoading={isLoading}
              teamMembers={teamMembers}
              conversationId={currentConversation?.id}
            />

            <ChatBotMessageInput
              inputMessage={inputMessage}
              isLoading={isLoading}
              isTyping={isTyping}
              onInputChange={setInputMessage}
              onSend={handleSendMessage}
              onStop={handleStopTyping}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
      </div>

      <ChatBotAnimations />
    </>
  );
};

