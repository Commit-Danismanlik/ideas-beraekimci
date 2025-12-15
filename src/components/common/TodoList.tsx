import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import ReactMarkdown from 'react-markdown';
import { ITeamTodo } from '../../models/TeamRepository.model';

interface TodoListProps {
  todos: ITeamTodo[];
  loading: boolean;
  getUserName: (userId: string) => string;
  canEditRepository: boolean;
  canDeleteRepository: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: ITeamTodo) => void;
  onDelete: (id: string) => void;
  itemsPerPage?: number;
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
  itemsPerPage = 6,
}: TodoListProps): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Pagination için todo'ları hesapla
  const paginatedTodos = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return todos.slice(startIndex, endIndex);
  }, [todos, currentPage, itemsPerPage]);

  const pageCount = Math.ceil(todos.length / itemsPerPage);

  // Sayfa değiştiğinde
  const handlePageClick = useCallback((event: { selected: number }): void => {
    setCurrentPage(event.selected);
  }, []);

  // todos değiştiğinde sayfayı sıfırla
  useEffect(() => {
    if (currentPage >= pageCount && pageCount > 0) {
      setCurrentPage(0);
    }
  }, [todos.length, currentPage, pageCount]);
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {paginatedTodos.map((todo) => (
        <div
          key={todo.id}
          className={`glass rounded-2xl p-4 flex items-start gap-3 border transition-all duration-300 hover:shadow-glow ${
            todo.completed
              ? 'opacity-60 border-indigo-400/20'
              : 'border-indigo-500/20 hover:border-indigo-400/40'
          }`}
        >
          {canEditRepository ? (
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleComplete(todo.id)}
                className="w-6 h-6 rounded-lg border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-purple-600 checked:border-transparent transition-all duration-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          ) : (
            <div
              className={`mt-1 w-6 h-6 border-2 rounded-lg flex items-center justify-center ${
                todo.completed
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent'
                  : 'border-indigo-500/50 bg-slate-800/50'
              }`}
            >
              {todo.completed && <span className="text-xs text-white font-bold">✓</span>}
            </div>
          )}
          <div className="flex-1">
            <h3
              className={`font-bold ${
                todo.completed ? 'line-through text-indigo-300/50' : 'text-indigo-100'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <div className="text-sm text-indigo-200/70 mt-1 prose prose-invert prose-indigo max-w-none prose-sm">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-indigo-100">{children}</strong>,
                    em: ({ children }) => <em className="italic text-indigo-200">{children}</em>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-200 text-xs">{children}</code>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-indigo-900/50 p-2 rounded-lg overflow-x-auto mb-1 text-xs">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5 text-xs">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5 text-xs">{children}</ol>,
                  }}
                >
                  {todo.description}
                </ReactMarkdown>
              </div>
            )}
            {todo.assignedTo && (
              <p className="text-xs text-blue-400 mt-1 font-semibold">
                🎯 Atanan: {getUserName(todo.assignedTo)}
              </p>
            )}
            <div className="mt-2 flex gap-2 items-center flex-wrap">
              <span
                className={`inline-block px-3 py-1 text-xs font-bold rounded-xl ${
                  todo.priority === 'high'
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300'
                    : todo.priority === 'medium'
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-300'
                      : 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/30 text-slate-300'
                }`}
              >
                {todo.priority === 'high'
                  ? '🔴 Yüksek'
                  : todo.priority === 'medium'
                    ? '🟡 Orta'
                    : '⚪ Düşük'}
              </span>
              <p className="text-xs text-indigo-300/60">
                📅 {new Date(todo.createdAt).toLocaleString('tr-TR')} 👤{' '}
                {getUserName(todo.createdBy)}
              </p>
            </div>
          </div>
          <div className="flex gap-1 flex-col">
            {canEditRepository && (
              <button
                onClick={() => onEdit(todo)}
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                title="Düzenle"
              >
                ✏️
              </button>
            )}
            {canDeleteRepository && (
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                title="Sil"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
      </div>

      {/* Pagination */}
      {todos.length > 0 && pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <ReactPaginate
            breakLabel="..."
            nextLabel="Sonraki >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel="< Önceki"
            renderOnZeroPageCount={null}
            containerClassName="flex items-center gap-2"
            pageClassName="bg-gray-800 border border-gray-700 rounded text-gray-200 hover:bg-gray-700 cursor-pointer transition-colors select-none"
            pageLinkClassName="block px-3 py-2 w-full h-full"
            previousClassName="bg-gray-800 border border-gray-700 rounded text-gray-200 hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
            previousLinkClassName="block px-3 py-2 w-full h-full"
            nextClassName="bg-gray-800 border border-gray-700 rounded text-gray-200 hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
            nextLinkClassName="block px-3 py-2 w-full h-full"
            breakClassName="px-3 py-2 text-gray-400 select-none"
            activeClassName="bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700"
            disabledClassName="opacity-50 cursor-not-allowed"
            forcePage={currentPage}
          />
        </div>
      )}
    </>
  );
};

/**
 * Memoized TodoList Component
 * Performance: Props değişmediğinde re-render'ı önler
 */
export const TodoList = memo(TodoListComponent);

