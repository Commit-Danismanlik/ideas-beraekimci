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
    <div className="rounded-2xl p-4">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
      />
    </div>
  );
};
