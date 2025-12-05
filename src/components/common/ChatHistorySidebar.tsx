import { useEffect } from 'react';
import { useChatConversations } from '../../hooks/useChatConversations';
import { IChatConversation } from '../../models/ChatConversation.model';

interface ChatHistorySidebarProps {
  teamId: string | null;
  isOpen: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversation: IChatConversation | null) => void;
  onNewConversation: () => void;
  refreshKey?: number;
}

export const ChatHistorySidebar = ({
  teamId,
  isOpen,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  refreshKey,
}: ChatHistorySidebarProps): JSX.Element | null => {
  const { conversations, loading, loadConversations } = useChatConversations();

  useEffect(() => {
    if (teamId) {
      console.log('ChatHistorySidebar: Conversations yükleniyor...', { teamId, refreshKey });
      loadConversations(teamId);
    }
  }, [teamId, loadConversations, refreshKey]);

  if (!teamId) {
    return null;
  }

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Bugün';
    } else if (days === 1) {
      return 'Dün';
    } else if (days < 7) {
      return `${days} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-indigo-500/20">
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Geçmiş Sohbetler
        </h3>
        <button
          onClick={onNewConversation}
          className="p-1.5 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
          title="Yeni Sohbet"
        >
          ➕
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center text-indigo-300/70 py-8">
            <p>Yükleniyor...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-indigo-300/70 py-8">
            <p className="text-sm">Henüz sohbet yok</p>
            <button
              onClick={onNewConversation}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-glow text-sm"
            >
              Yeni Sohbet Başlat
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedConversationId === conversation.id
                    ? 'bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border border-indigo-500/50'
                    : 'glass hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-indigo-200 line-clamp-2">
                    {conversation.title}
                  </h4>
                  <p className="text-xs text-indigo-300/70">
                    {formatDate(conversation.updatedAt)}
                  </p>
                  {conversation.messages.length > 0 && (
                    <p className="text-xs text-indigo-400/60 line-clamp-1 mt-1">
                      {conversation.messages.length} mesaj
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
