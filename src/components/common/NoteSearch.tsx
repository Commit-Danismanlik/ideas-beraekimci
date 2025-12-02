interface NoteSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * NoteSearch Component
 * SOLID: Single Responsibility - Sadece not arama işlevinden sorumlu
 */
export const NoteSearch = ({ searchQuery, onSearchChange }: NoteSearchProps): JSX.Element => {
  return (
    <div className="mb-4 glass rounded-2xl p-4 border border-indigo-500/20 shadow-glow">
      <h3 className="text-sm font-bold text-indigo-200 mb-3">🔍 Arama</h3>
      <input
        type="text"
        placeholder="Not başlığı, içerik veya kategori ara..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
      />
    </div>
  );
};

