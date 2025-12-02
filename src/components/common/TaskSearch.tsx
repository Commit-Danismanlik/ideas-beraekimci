interface TaskSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * TaskSearch Component
 * SOLID: Single Responsibility - Sadece arama işlevinden sorumlu
 */
export const TaskSearch = ({ searchQuery, onSearchChange }: TaskSearchProps): JSX.Element => {
  return (
    <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Arama</h3>
      <input
        type="text"
        placeholder="Task başlığı, açıklama veya atanan kişi ara..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-600"
      />
    </div>
  );
};

