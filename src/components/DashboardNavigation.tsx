import { ViewType } from '../hooks/useDashboard';

interface DashboardNavigationProps {
  activeView: ViewType;
  canManageTeam: boolean;
  onViewChange: (view: ViewType) => void;
}

export const DashboardNavigation = ({
  activeView,
  canManageTeam,
  onViewChange,
}: DashboardNavigationProps): JSX.Element => {
  return (
    <div className="glass-strong rounded-3xl shadow-glow-lg p-4 lg:p-6 mb-6 animate-fade-in-up">
      <div
        className={`grid gap-3 lg:gap-4 ${
          canManageTeam
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        <button
          onClick={() => onViewChange('personal')}
          className={`py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform ${
            activeView === 'personal'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]'
              : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]'
          }`}
        >
          📝 Personal
        </button>
        <button
          onClick={() => onViewChange('repositories')}
          className={`py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform ${
            activeView === 'repositories'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]'
              : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]'
          }`}
        >
          📦 Repositories
        </button>
        <button
          onClick={() => onViewChange('tasks')}
          className={`py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform ${
            activeView === 'tasks'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]'
              : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]'
          }`}
        >
          ✅ Tasks
        </button>
        {canManageTeam && (
          <button
            onClick={() => onViewChange('management')}
            className={`py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform ${
              activeView === 'management'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]'
                : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]'
            }`}
          >
            ⚙️ Yönetim
          </button>
        )}
      </div>
    </div>
  );
};

