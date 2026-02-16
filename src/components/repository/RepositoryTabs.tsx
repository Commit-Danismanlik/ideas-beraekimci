type TabType = 'notes' | 'todos';

interface RepositoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * RepositoryTabs Component
 * SOLID: Single Responsibility - Sadece tab switching'den sorumlu
 */
export const RepositoryTabs = ({ activeTab, onTabChange }: RepositoryTabsProps): JSX.Element => {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('notes')}
        className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 transform ${
          activeTab === 'notes'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
            : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105'
        }`}
      >
        📝 Notlar
      </button>
      <button
        onClick={() => onTabChange('todos')}
        className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 transform ${
          activeTab === 'todos'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
            : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105'
        }`}
      >
        ✅ To-Do List
      </button>
    </div>
  );
};
