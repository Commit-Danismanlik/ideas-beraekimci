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
    <div className="flex flex-row lg:flex-col gap-2 lg:gap-4 mb-4 lg:mb-6 flex-wrap sm:flex-nowrap">
      <button
        onClick={() => onTabChange('notes')}
        className={`flex-1 lg:flex-initial px-4 sm:px-6 py-2 rounded-xl font-bold transition-all duration-300 transform text-sm sm:text-base ${
          activeTab === 'notes'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
            : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105'
        }`}
      >
        📝 Notlar
      </button>
      <button
        onClick={() => onTabChange('todos')}
        className={`flex-1 lg:flex-initial px-4 sm:px-6 py-2 rounded-xl font-bold transition-all duration-300 transform text-sm sm:text-base ${
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
