import { memo } from 'react';
import { ITeamNote } from '../../models/TeamRepository.model';

interface NoteListProps {
  notes: ITeamNote[];
  loading: boolean;
  getUserName: (userId: string) => string;
  canEditRepository: boolean;
  canDeleteRepository: boolean;
  onEdit: (note: ITeamNote) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * NoteList Component
 * SOLID: Single Responsibility - Sadece not listesinden sorumlu
 * Performance: React.memo ile optimize edildi
 */
const NoteListComponent = ({
  notes,
  loading,
  getUserName,
  canEditRepository,
  canDeleteRepository,
  onEdit,
  onTogglePin,
  onDelete,
  hasMore,
  onLoadMore,
}: NoteListProps): JSX.Element => {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <div
            className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-purple-600/20"
            style={{ animationDirection: 'reverse' }}
          ></div>
        </div>
        <p className="mt-4 text-indigo-300 font-semibold">Yükleniyor...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-2xl border border-indigo-500/20">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-xl font-bold text-indigo-200">Henüz not yok</p>
        <p className="text-sm text-indigo-300/60 mt-2">
          İlk notunuzu oluşturmak için yukarıdaki butonu kullanın
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`glass rounded-2xl p-4 border transition-all duration-300 hover:shadow-glow ${
              note.isPinned
                ? 'border-lime-500/50 bg-gradient-to-br from-lime-950/30 to-emerald-950/30 shadow-lime-500/20'
                : 'border-indigo-500/20 hover:border-indigo-400/40'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-indigo-100">
                {note.isPinned && '📌 '}
                {note.title}
              </h3>
              <div className="flex gap-2">
                {canEditRepository && (
                  <button
                    onClick={() => onEdit(note)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                )}
                {canEditRepository && (
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                  >
                    {note.isPinned ? '🔓' : '📌'}
                  </button>
                )}
                {canDeleteRepository && (
                  <button
                    onClick={() => onDelete(note.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title="Sil"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <p className="text-indigo-200/80 mb-3 whitespace-pre-wrap h-40 overflow-y-auto">
              {note.content}
            </p>
            {note.category && (
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl mb-3">
                {note.category}
              </span>
            )}
            <p className="text-xs text-indigo-300/60 mt-2">
              📅 {new Date(note.createdAt).toLocaleString('tr-TR')} 👤 {getUserName(note.createdBy)}
            </p>
          </div>
        ))}
      </div>

      {/* Daha Fazla Yükle */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-500/30 rounded-xl text-indigo-100 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-indigo-500/50"
          >
            Daha Fazla Yükle
          </button>
        </div>
      )}
    </>
  );
};

/**
 * Memoized NoteList Component
 * Performance: Props değişmediğinde re-render'ı önler
 */
export const NoteList = memo(NoteListComponent);

