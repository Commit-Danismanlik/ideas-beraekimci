import { memo, useState, useMemo, useEffect } from 'react';
import { ITeamNote } from '../../models/TeamRepository.model';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const PAGE_SIZE = 8;

interface NoteListProps {
  notes: ITeamNote[];
  loading: boolean;
  getUserName: (userId: string) => string;
  canEditRepository: boolean;
  canDeleteRepository: boolean;
  onEdit: (note: ITeamNote) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
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
}: NoteListProps): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [notes.length]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(notes.length / PAGE_SIZE) || 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedNotes = notes.slice(startIndex, startIndex + PAGE_SIZE);
    return { totalPages, paginatedNotes };
  }, [notes, currentPage]);

  const { totalPages, paginatedNotes } = paginationData;

  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
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
    <div className="pl-0 sm:pl-2 lg:pl-4 w-full min-w-0 mt-4 sm:mt-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {paginatedNotes.map((note) => (
          <div
            key={note.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${
              note.isPinned
                ? 'border-l-4 border-l-lime-500/80 border-lime-500/40 bg-gradient-to-br from-lime-950/40 via-emerald-950/20 to-slate-950/50 shadow-lg shadow-lime-500/10'
                : 'border-indigo-500/20 glass hover:border-indigo-400/50'
            }`}
          >
            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-start gap-3 mb-4">
                <h3 className="text-lg font-bold text-indigo-50 leading-tight min-w-0 flex-1">
                  {note.isPinned && (
                    <span className="inline-block mr-1.5 text-lime-400" title="Sabitlendi">
                      📌
                    </span>
                  )}
                  <span className="line-clamp-2">{note.title}</span>
                </h3>
                <div className="flex shrink-0 gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {canEditRepository && (
                    <button
                      onClick={() => onEdit(note)}
                      className="p-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                  )}
                  {canEditRepository && (
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                        note.isPinned
                          ? 'text-lime-400 hover:text-lime-300 hover:bg-lime-500/20'
                          : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/20'
                      }`}
                      title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                    >
                      {note.isPinned ? '🔓' : '📌'}
                    </button>
                  )}
                  {canDeleteRepository && (
                    <button
                      onClick={() => onDelete(note.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <p className="text-indigo-200/90 text-sm leading-relaxed whitespace-pre-wrap h-28 sm:h-36 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-indigo-500/30">
                  {note.content || (
                    <span className="text-indigo-400/50 italic">İçerik yok</span>
                  )}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {note.category && (
                  <span className="px-3 py-1 text-xs font-medium bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 rounded-lg">
                    {note.category}
                  </span>
                )}
                <span className="text-xs text-indigo-400/70 flex items-center gap-1.5 ml-auto flex-shrink-0 min-w-0">
                  <span>📅</span>
                  <span>{new Date(note.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-indigo-500/50">•</span>
                  <span>👤</span>
                  <span className="truncate max-w-[100px]" title={getUserName(note.createdBy)}>
                    {getUserName(note.createdBy)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 overflow-x-auto">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={
                    currentPage <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {getVisiblePages().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    currentPage >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

/**
 * Memoized NoteList Component
 */
export const NoteList = memo(NoteListComponent);
