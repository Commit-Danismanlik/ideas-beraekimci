import { FiltersInput } from '../common/FiltersInput';

interface ITodoFilter {
  dateSort: 'newest' | 'oldest';
  creatorId: string;
}

interface TodoFiltersProps {
  filter: ITodoFilter;
  members: { userId: string; displayName?: string; email?: string }[];
  onFilterChange: (filter: ITodoFilter) => void;
}

/**
 * TodoFilters Component
 * FiltersInput ortak bileşenini todo filtreleri için kullanır
 */
export const TodoFilters = ({
  filter,
  members,
  onFilterChange,
}: TodoFiltersProps): JSX.Element => (
  <FiltersInput filter={filter} members={members} onFilterChange={onFilterChange} />
);
