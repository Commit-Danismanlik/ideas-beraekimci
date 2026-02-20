import { SearchInput } from '../common/SearchInput';

interface TodoSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * TodoSearch Component
 * SearchInput ortak bileşenini todo araması için kullanır
 */
export const TodoSearch = ({ searchQuery, onSearchChange }: TodoSearchProps): JSX.Element => (
  <SearchInput
    searchQuery={searchQuery}
    onSearchChange={onSearchChange}
    placeholder="To-Do başlığı veya açıklama ara..."
  />
);
