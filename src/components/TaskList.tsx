import { ITask } from '../models/Task.model';
import { MemoizedVirtualizedList } from './VirtualizedList';

interface IMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface TaskListProps {
  tasks: ITask[];
  filteredTasks: ITask[];
  membersMap: Map<string, IMember>;
  loading: boolean;
  canDeleteTask: boolean;
  onTaskClick: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * TaskList Component
 * SOLID: Single Responsibility - Sadece görev listesinden sorumlu
 */
export const TaskList = ({
  tasks,
  filteredTasks,
  membersMap,
  loading,
  canDeleteTask,
  onTaskClick,
  onDeleteTask,
  hasMore,
  onLoadMore,
}: TaskListProps): JSX.Element => {
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

  return (
    <>
      <MemoizedVirtualizedList
        items={filteredTasks}
        itemKey={(t) => t.id}
        itemHeight={120}
        height={Math.min(600, Math.max(320, filteredTasks.length * 120))}
        className=""
        renderItem={(task) => {
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
                    <p className="text-gray-400 mt-0.5 line-clamp-1 text-sm">
                      {task.description}
                    </p>
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
        }}
      />

      {/* Daha Fazla Yükle */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 hover:bg-gray-700"
          >
            Daha Fazla Yükle
          </button>
        </div>
      )}
    </>
  );
};

