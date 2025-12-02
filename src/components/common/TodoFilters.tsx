interface IMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface ITodoFilter {
  dateSort: 'newest' | 'oldest';
  creatorId: string;
}

interface TodoFiltersProps {
  filter: ITodoFilter;
  members: IMember[];
  onFilterChange: (filter: ITodoFilter) => void;
}

/**
 * TodoFilters Component
 * SOLID: Single Responsibility - Sadece todo filtreleme işlevinden sorumlu
 */
export const TodoFilters = ({
  filter,
  members,
  onFilterChange,
}: TodoFiltersProps): JSX.Element => {
  return (
    <div className="mb-4 glass rounded-2xl p-4 border border-indigo-500/20 shadow-glow">
      <h3 className="text-sm font-bold text-indigo-200 mb-3">🔍 Filtreler</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-indigo-300/80 mb-2">
            Tarih Sıralama
          </label>
          <select
            value={filter.dateSort}
            onChange={(e) =>
              onFilterChange({ ...filter, dateSort: e.target.value as 'newest' | 'oldest' })
            }
            className="w-full px-3 py-2 glass border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all"
          >
            <option value="newest">En Yeniden En Eskiye</option>
            <option value="oldest">En Eskiden En Yeniye</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-indigo-300/80 mb-2">
            Oluşturan Kişi
          </label>
          <select
            value={filter.creatorId}
            onChange={(e) => onFilterChange({ ...filter, creatorId: e.target.value })}
            className="w-full px-3 py-2 glass border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all"
          >
            <option value="all">Tümü</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.displayName || member.email}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

