import { useState, useCallback } from 'react';
import { getChatConversationService } from '../di/container';
import { IChatConversation, ICreateChatConversationDto } from '../models/ChatConversation.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export interface UseChatConversationsReturn {
  conversations: IChatConversation[];
  loading: boolean;
  error: string | null;
  createConversation: (
    teamId: string,
    userId: string,
    dto: ICreateChatConversationDto
  ) => Promise<IQueryResult<IChatConversation>>;
  loadConversations: (teamId: string) => Promise<void>;
  loadRecentConversations: (teamId: string, limit: number) => Promise<void>;
  updateConversation: (
    teamId: string,
    conversationId: string,
    dto: { title?: string; messages?: IChatConversation['messages'] }
  ) => Promise<IQueryResult<IChatConversation>>;
  deleteConversation: (
    teamId: string,
    conversationId: string
  ) => Promise<IQueryResult<boolean>>;
}

export const useChatConversations = (): UseChatConversationsReturn => {
  const [conversations, setConversations] = useState<IChatConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const conversationService = getChatConversationService();

  const loadConversations = useCallback(
    async (teamId: string): Promise<void> => {
      if (!teamId) {
        console.log('useChatConversations: teamId yok, conversations temizleniyor');
        setConversations([]);
        return;
      }

      console.log('useChatConversations: Conversations yükleniyor...', { teamId });
      setLoading(true);
      setError(null);
      try {
        const result: IListQueryResult<IChatConversation> = await conversationService.getAllConversations(teamId);
        if (result.success) {
          console.log('useChatConversations: Conversations başarıyla yüklendi', {
            count: result.data.length,
            conversations: result.data.map((c) => ({ id: c.id, title: c.title })),
          });
          setConversations(result.data);
        } else {
          console.error('useChatConversations: Conversations yüklenemedi', result.error);
          setError(result.error || 'Konuşmalar yüklenemedi');
          setConversations([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        console.error('useChatConversations: Hata oluştu', err);
        setError(errorMessage);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [conversationService]
  );

  const loadRecentConversations = useCallback(
    async (teamId: string, limit: number): Promise<void> => {
      if (!teamId) {
        setConversations([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result: IListQueryResult<IChatConversation> = await conversationService.getRecentConversations(teamId, limit);
        if (result.success) {
          setConversations(result.data);
        } else {
          setError(result.error || 'Konuşmalar yüklenemedi');
          setConversations([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [conversationService]
  );

  const createConversation = useCallback(
    async (
      teamId: string,
      userId: string,
      dto: ICreateChatConversationDto
    ): Promise<IQueryResult<IChatConversation>> => {
      console.log('useChatConversations: createConversation çağrıldı', { teamId, userId, title: dto.title });
      setError(null);
      try {
        const result = await conversationService.createConversation(teamId, userId, dto);
        if (result.success && result.data) {
          console.log('useChatConversations: Conversation başarıyla oluşturuldu ve listeye eklendi', {
            conversationId: result.data.id,
            title: result.data.title,
          });
          // Yeni konuşmayı listeye ekle
          setConversations((prev) => [result.data!, ...prev]);
        } else {
          console.error('useChatConversations: Conversation oluşturulamadı', result.error);
          setError(result.error || 'Konuşma oluşturulamadı');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        console.error('useChatConversations: createConversation hatası', err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [conversationService]
  );

  const updateConversation = useCallback(
    async (
      teamId: string,
      conversationId: string,
      dto: { title?: string; messages?: IChatConversation['messages'] }
    ): Promise<IQueryResult<IChatConversation>> => {
      setError(null);
      try {
        const result = await conversationService.updateConversation(teamId, conversationId, dto);
        if (result.success && result.data) {
          // Güncellenmiş konuşmayı listede güncelle
          setConversations((prev) =>
            prev.map((conv) => (conv.id === conversationId ? result.data! : conv))
          );
        } else {
          setError(result.error || 'Konuşma güncellenemedi');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [conversationService]
  );

  const deleteConversation = useCallback(
    async (
      teamId: string,
      conversationId: string
    ): Promise<IQueryResult<boolean>> => {
      setError(null);
      try {
        const result = await conversationService.deleteConversation(teamId, conversationId);
        if (result.success) {
          // Konuşmayı listeden kaldır
          setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
        } else {
          setError(result.error || 'Konuşma silinemedi');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [conversationService]
  );

  return {
    conversations,
    loading,
    error,
    createConversation,
    loadConversations,
    loadRecentConversations,
    updateConversation,
    deleteConversation,
  };
};
