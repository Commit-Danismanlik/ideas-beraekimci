import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ITask } from '../../models/Task.model';
import { MemoizedVirtualizedList } from './VirtualizedList';
import ReactPaginate from 'react-paginate';

interface IMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface TaskListProps {
  tasks: ITask[];
  filteredTasks: ITask[];
  membersMap: ReadonlyMap<string, IMember> | Map<string, IMember>;
  loading: boolean;
  canDeleteTask: boolean;
  onTaskClick: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  itemsPerPage?: number;
  columnCount?: number;
}

/**
 * TaskList Component
 * SOLID: Single Responsibility - Sadece görev listesinden sorumlu
 * Performance: React.memo ile optimize edildi
 */
const TaskListComponent = ({
  tasks,
  filteredTasks,
  membersMap,
  loading,
  canDeleteTask,
  onTaskClick,
  onDeleteTask,
  itemsPerPage = 5,
  columnCount = 1,
}: TaskListProps): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Pagination için görevleri hesapla
  const paginatedTasks = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, itemsPerPage]);

  // Kolonlara göre görevleri böl
  const tasksByColumns = useMemo(() => {
    if (columnCount === 1) {
      return [paginatedTasks];
    }
    const columns: ITask[][] = Array.from({ length: columnCount }, () => []);
    paginatedTasks.forEach((task, index) => {
      columns[index % columnCount].push(task);
    });
    return columns;
  }, [paginatedTasks, columnCount]);

  const pageCount = Math.ceil(filteredTasks.length / itemsPerPage);

  // Sayfa değiştiğinde
  const handlePageClick = useCallback((event: { selected: number }): void => {
    setCurrentPage(event.selected);
  }, []);

  // filteredTasks değiştiğinde sayfayı sıfırla
  useEffect(() => {
    if (currentPage >= pageCount && pageCount > 0) {
      setCurrentPage(0);
    }
  }, [filteredTasks.length, currentPage, pageCount]);

  const renderTaskItem = useCallback(
    (task: ITask) => {
      const assignedMember = task.assignedTo ? membersMap.get(task.assignedTo) : undefined;
      return (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className={`border rounded-lg px-3 py-2 hover:shadow-md transition-shadow cursor-pointer h-[120px] ${
            task.status === 'done'
              ? 'bg-green-900/20 border-green-700'
              : task.status === 'in-progress'
                ? 'bg-blue-900/20 border-blue-700'
                : 'bg-gray-800 border-gray-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-100">{task.title}</h3>
              {task.description && (
                <div className="text-gray-400 mt-0.5 line-clamp-1 text-sm prose prose-invert prose-gray max-w-none prose-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-0 inline">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-gray-300">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-400">{children}</em>,
                      code: ({ children }) => (
                        <code className="bg-gray-900/50 px-1 py-0.5 rounded text-gray-300 text-xs">{children}</code>
                      ),
                    }}
                  >
                    {task.description}
                  </ReactMarkdown>
                </div>
              )}
              {assignedMember && (
                <p className="text-xs text-blue-400 mt-0.5">
                  👤 {assignedMember.displayName || assignedMember.email}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <span
                  className={`px-1.5 py-0.5 text-xs rounded item ${
                    task.priority === 'high'
                      ? 'bg-red-900 text-red-200'
                      : task.priority === 'medium'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {task.priority === 'high'
                    ? '🔴'
                    : task.priority === 'medium'
                      ? '🟡'
                      : '⚪'}
                </span>
              </div>
            </div>
            {canDeleteTask && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="ml-2 hover:text-red-300 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 my-auto rounded-lg"
              >
                <h1 className="text-xs">🗑️ Sil</h1>
              </button>
            )}
          </div>
        </div>
      );
    },
    [membersMap, onTaskClick, canDeleteTask, onDeleteTask]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-lg">Bu takımda henüz görev yok</p>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 bg-yellow-900 rounded-lg border border-yellow-700">
        <p className="text-yellow-200 text-lg">Filtreye uygun görev bulunamadı</p>
      </div>
    );
  }

  if (columnCount === 1) {
    return (
      <>
        <MemoizedVirtualizedList
          items={paginatedTasks}
          itemKey={(t) => t.id}
          itemHeight={120}
          height={Math.min(600, Math.max(320, paginatedTasks.length * 120))}
          className=""
          renderItem={renderTaskItem}
        />

        {/* Pagination */}
        {pageCount > 1 && (
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
  }

  return (
    <>
      <div className={`grid gap-4 ${columnCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {tasksByColumns.map((columnTasks, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {columnTasks.map((task) => renderTaskItem(task))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
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
 * Memoized TaskList Component
 * Performance: Props değişmediğinde re-render'ı önler
 */
export const TaskList = memo(TaskListComponent);

