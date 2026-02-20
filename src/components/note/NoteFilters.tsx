import { FiltersInput } from '../common/FiltersInput';

interface INoteFilter {
  dateSort: 'newest' | 'oldest';
  creatorId: string;
}

interface NoteFiltersProps {
  filter: INoteFilter;
  members: { userId: string; displayName?: string; email?: string }[];
  onFilterChange: (filter: INoteFilter) => void;
}

/**
 * NoteFilters Component
 * FiltersInput ortak bileşenini not filtreleri için kullanır
 */
export const NoteFilters = ({
  filter,
  members,
  onFilterChange,
}: NoteFiltersProps): JSX.Element => (
  <FiltersInput filter={filter} members={members} onFilterChange={onFilterChange} />
);
