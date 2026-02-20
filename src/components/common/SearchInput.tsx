import { TfiSearch } from 'react-icons/tfi';

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

/**
 * SearchInput Component
 * Ortak arama bileşeni - Note ve Todo aramalarında kullanılır
 */
export const SearchInput = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Ara...',
}: SearchInputProps): JSX.Element => {
  return (
    <div className="p-4">
      <div className="rounded-xl w-full min-w-0 flex items-center gap-2 glass border border-indigo-500/30">
        <TfiSearch className="text-indigo-400/70 shrink-0 w-5 h-5 ml-3" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-transparent text-indigo-200 placeholder-indigo-300/50 focus:ring-0 focus:outline-none text-sm sm:text-base"
        />
      </div>
    </div>
  );
};
