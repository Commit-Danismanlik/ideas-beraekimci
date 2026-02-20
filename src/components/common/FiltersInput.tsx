interface IMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface IFilter {
  dateSort: 'newest' | 'oldest';
  creatorId: string;
}

interface FiltersInputProps {
  filter: IFilter;
  members: IMember[];
  onFilterChange: (filter: IFilter) => void;
}

/**
 * FiltersInput Component
 * Ortak filtre bileşeni - Not ve Todo filtrelerinde kullanılır
 */
export const FiltersInput = ({
  filter,
  members,
  onFilterChange,
}: FiltersInputProps): JSX.Element => {
  return (
    <div className="rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-x-2.5">
        <div>
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
