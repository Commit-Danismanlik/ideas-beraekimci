import { useEffect, useState, useRef } from 'react';
import { useChatConversations } from '../../hooks/useChatConversations';
import { IChatConversation } from '../../models/ChatConversation.model';
import { usePermissions } from '../../hooks/usePermissions';

interface ChatHistorySidebarProps {
  teamId: string | null;
  isOpen: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversation: IChatConversation | null) => void;
  onNewConversation: () => void;
  refreshKey?: number;
  onConversationUpdated?: () => void;
}

export const ChatHistorySidebar = ({
  teamId,
  isOpen,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  refreshKey,
  onConversationUpdated,
}: ChatHistorySidebarProps): JSX.Element | null => {
  const { conversations, loading, loadConversations, updateConversation, deleteConversation } = useChatConversations();
  const { hasPermission } = usePermissions(teamId);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Kullanıcının chat conversation düzenleme/silme yetkisi var mı?
  const canEditConversation = hasPermission('EDIT_CHAT_CONVERSATION');
  const canDeleteConversation = hasPermission('DELETE_CHAT_CONVERSATION');
  const canManageConversation = canEditConversation || canDeleteConversation;

  useEffect(() => {
    if (teamId) {
      console.log('ChatHistorySidebar: Conversations yükleniyor...', { teamId, refreshKey });
      loadConversations(teamId);
    }
  }, [teamId, loadConversations, refreshKey]);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Edit input'a focus ver
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

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

  const handleMenuToggle = (e: React.MouseEvent, conversationId: string): void => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === conversationId ? null : conversationId);
  };

  const handleEditClick = (e: React.MouseEvent, conversation: IChatConversation): void => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = async (e: React.FormEvent, conversationId: string): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    if (!teamId || !editTitle.trim()) {
      return;
    }

    const result = await updateConversation(teamId, conversationId, { title: editTitle.trim() });
    if (result.success) {
      // Düzenleme modunu kapat
      setEditingId(null);
      setEditTitle('');
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    }
  };

  const handleEditCancel = (): void => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string): void => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeletingId(conversationId);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!teamId || !deletingId) {
      setDeletingId(null);
      return;
    }

    const result = await deleteConversation(teamId, deletingId);
    if (result.success) {
      // Eğer silinen conversation seçiliyse, seçimi temizle
      if (selectedConversationId === deletingId) {
        onSelectConversation(null);
      }
      setDeletingId(null);
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    }
  };

  const handleDeleteCancel = (): void => {
    setDeletingId(null);
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
              <div
                key={conversation.id}
                className={`relative group w-full p-3 rounded-xl transition-all ${
                  selectedConversationId === conversation.id
                    ? 'bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border border-indigo-500/50'
                    : 'glass hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30'
                }`}
              >
                {editingId === conversation.id ? (
                  // Edit Mode
                  <form
                    onSubmit={(e) => handleEditSave(e, conversation.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col gap-2"
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Başlık"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div
                      onClick={() => onSelectConversation(conversation)}
                      className="w-full text-left flex flex-col gap-1 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-indigo-200 line-clamp-2 flex-1">
                          {conversation.title}
                        </h4>
                        {/* Üç Nokta Menü - Sadece yetkisi olanlar görebilir */}
                        {canManageConversation && (
                          <button
                            onClick={(e) => handleMenuToggle(e, conversation.id)}
                            className="p-1 text-indigo-300/70 hover:text-indigo-200 hover:bg-indigo-500/20 rounded transition-all flex-shrink-0"
                            title="Menü"
                          >
                            <span className="text-lg">⋯</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-indigo-300/70">
                        {formatDate(conversation.updatedAt)}
                      </p>
                      {conversation.messages.length > 0 && (
                        <p className="text-xs text-indigo-400/60 line-clamp-1 mt-1">
                          {conversation.messages.length} mesaj
                        </p>
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    {openMenuId === conversation.id && canManageConversation && (
                      <div
                        ref={menuRef}
                        className="absolute top-10 right-2 z-50 bg-slate-800 border border-indigo-500/30 rounded-lg shadow-lg overflow-hidden min-w-[140px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canEditConversation && (
                          <button
                            onClick={(e) => handleEditClick(e, conversation)}
                            className="w-full px-4 py-2 text-left text-sm text-indigo-200 hover:bg-indigo-500/20 flex items-center gap-2 transition-all"
                          >
                            <span className="text-indigo-400">✏️</span>
                            <span>Düzenle</span>
                          </button>
                        )}
                        {canDeleteConversation && (
                          <button
                            onClick={(e) => handleDeleteClick(e, conversation.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-all"
                          >
                            <span className="text-red-500">🗑️</span>
                            <span>Sil</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 border border-indigo-500/30 rounded-xl p-6 max-w-sm w-full mx-4 shadow-glow">
            <h3 className="text-lg font-bold text-indigo-200 mb-4">Sohbeti Sil</h3>
            <p className="text-sm text-indigo-300/70 mb-6">
              Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all"
              >
                Sil
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
