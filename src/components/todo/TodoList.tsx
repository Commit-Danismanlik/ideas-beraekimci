import { memo, useState, useMemo, useEffect } from 'react';
import { ITeamTodo } from '../../models/TeamRepository.model';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const PAGE_SIZE = 8;

interface TodoListProps {
  todos: ITeamTodo[];
  loading: boolean;
  getUserName: (userId: string) => string;
  canEditRepository: boolean;
  canDeleteRepository: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: ITeamTodo) => void;
  onDelete: (id: string) => void;
}

/**
 * TodoList Component
 * SOLID: Single Responsibility - Sadece todo listesinden sorumlu
 * Performance: React.memo ile optimize edildi
 */
const TodoListComponent = ({
  todos,
  loading,
  getUserName,
  canEditRepository,
  canDeleteRepository,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoListProps): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [todos.length]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(todos.length / PAGE_SIZE) || 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedTodos = todos.slice(startIndex, startIndex + PAGE_SIZE);
    return { totalPages, paginatedTodos };
  }, [todos, currentPage]);

  const { totalPages, paginatedTodos } = paginationData;

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

  if (todos.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-2xl border border-indigo-500/20">
        <div className="text-6xl mb-4">✅</div>
        <p className="text-xl font-bold text-indigo-200">Henüz todo yok</p>
        <p className="text-sm text-indigo-300/60 mt-2">
          İlk todo'nuzu oluşturmak için yukarıdaki butonu kullanın
        </p>
      </div>
    );
  }

  return (
    <div className="pl-4 w-full">
      <div className="flex flex-col gap-3">
        {paginatedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow px-4 py-3 flex items-center gap-3 ${
              todo.completed
                ? 'opacity-70 border-indigo-400/20 glass'
                : 'border-indigo-500/20 glass hover:border-indigo-400/50'
            }`}
          >
            {canEditRepository ? (
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleComplete(todo.id)}
                className="w-5 h-5 shrink-0 rounded border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-purple-600 checked:border-transparent transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
            ) : (
              <div
                className={`w-5 h-5 shrink-0 border-2 rounded flex items-center justify-center ${
                  todo.completed
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent'
                    : 'border-indigo-500/50 bg-slate-800/50'
                }`}
              >
                {todo.completed && <span className="text-[10px] text-white font-bold">✓</span>}
              </div>
            )}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <h3
                className={`font-bold text-indigo-50 leading-tight truncate shrink-0 max-w-[180px] ${
                  todo.completed ? 'line-through text-indigo-300/60' : ''
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-sm text-indigo-200/70 truncate flex-1 min-w-0">
                  {todo.description.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').slice(0, 60)}
                  {todo.description.length > 60 ? '...' : ''}
                </p>
              )}
              <span
                className={`shrink-0 px-3 py-1 text-xs font-medium rounded-lg ${
                  todo.priority === 'high'
                    ? 'bg-red-500/15 border border-red-400/25 text-red-300'
                    : todo.priority === 'medium'
                      ? 'bg-yellow-500/15 border border-yellow-400/25 text-yellow-300'
                      : 'bg-indigo-500/15 border border-indigo-400/25 text-indigo-200'
                }`}
              >
                {todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük'}
              </span>
              <span className="text-xs text-indigo-400/70 shrink-0 hidden sm:flex items-center gap-1">
                <span>📅</span>
                <span>
                  {new Date(todo.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-indigo-500/50">•</span>
                <span>👤</span>
                <span className="truncate max-w-[80px]" title={getUserName(todo.createdBy)}>
                  {getUserName(todo.createdBy)}
                </span>
              </span>
            </div>
            <div className="flex shrink-0 gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              {canEditRepository && (
                <button
                  onClick={() => onEdit(todo)}
                  className="p-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Düzenle"
                >
                  ✏️
                </button>
              )}
              {canDeleteRepository && (
                <button
                  onClick={() => onDelete(todo.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Sil"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
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
                    currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
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
                    currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
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
 * Memoized TodoList Component
 * Performance: Props değişmediğinde re-render'ı önler
 */
export const TodoList = memo(TodoListComponent);
