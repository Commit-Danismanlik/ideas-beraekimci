import { WeekPicker } from './WeekPicker';

interface ITaskFilters {
  status: 'all' | 'todo' | 'in-progress' | 'done';
  priority: 'all' | 'low' | 'medium' | 'high';
  assignedTo: string;
}

interface ITaskCounts {
  total: number;
  byStatus: {
    'todo': number;
    'in-progress': number;
    'done': number;
  };
  byPriority: {
    'high': number;
    'medium': number;
    'low': number;
  };
  byAssignee: Record<string, number>;
  unassigned: number;
}

interface TaskFiltersProps {
  filters: ITaskFilters;
  counts: ITaskCounts;
  members: Array<{ userId: string; displayName?: string; email?: string }>;
  selectedWeek: Date | null;
  onFiltersChange: (filters: ITaskFilters) => void;
  onWeekSelect: (date: Date | null) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

/**
 * TaskFilters Component
 * SOLID: Single Responsibility - Sadece filtreleme işlevinden sorumlu
 */
export const TaskFilters = ({
  filters,
  counts,
  members,
  selectedWeek,
  onFiltersChange,
  onWeekSelect,
  onClearFilters,
  filteredCount,
  totalCount,
}: TaskFiltersProps): JSX.Element => {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignedTo !== 'all' ||
    selectedWeek !== null;

  return (
    <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Filtreler</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filtresi */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Durum</label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as typeof filters.status })
            }
            className="w-full px-3 py-2 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-sm text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
          >
            <option value="all">Tümü ({counts.total})</option>
            <option value="todo">📝 Yapılacak ({counts.byStatus['todo']})</option>
            <option value="in-progress">⏳ Devam Ediyor ({counts.byStatus['in-progress']})</option>
            <option value="done">✅ Tamamlanan ({counts.byStatus['done']})</option>
          </select>
        </div>

        {/* Priority Filtresi */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Öncelik</label>
          <select
            value={filters.priority}
            onChange={(e) =>
              onFiltersChange({ ...filters, priority: e.target.value as typeof filters.priority })
            }
            className="w-full px-3 py-2 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-sm text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
          >
            <option value="all">Tümü</option>
            <option value="high">🔴 Yüksek ({counts.byPriority['high']})</option>
            <option value="medium">🟡 Orta ({counts.byPriority['medium']})</option>
            <option value="low">⚪ Düşük ({counts.byPriority['low']})</option>
          </select>
        </div>

        {/* Atanan Kişi Filtresi */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Atanan Kişi</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => onFiltersChange({ ...filters, assignedTo: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-sm text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
          >
            <option value="all">Tümü</option>
            <option value="unassigned">Atanmamış ({counts.unassigned})</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.displayName || member.email} ({counts.byAssignee[member.userId] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Tarih Filtresi - Haftalık */}
        <WeekPicker
          selectedWeek={selectedWeek}
          onWeekSelect={onWeekSelect}
          onClear={() => onWeekSelect(null)}
        />
      </div>

      {/* Aktif Filtre Bilgisi */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Gösterilen: <span className="font-semibold text-indigo-600">{filteredCount}</span> /{' '}
            {totalCount} görev
          </p>
          <button
            onClick={onClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
};

