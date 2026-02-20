import { SearchInput } from '../common/SearchInput';

interface NoteSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * NoteSearch Component
 * SearchInput ortak bileşenini not araması için kullanır
 */
export const NoteSearch = ({ searchQuery, onSearchChange }: NoteSearchProps): JSX.Element => (
  <SearchInput
    searchQuery={searchQuery}
    onSearchChange={onSearchChange}
    placeholder="Not başlığı, içerik veya kategori ara..."
  />
);
