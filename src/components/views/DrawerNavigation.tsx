import { NavLink } from 'react-router-dom';
import { useDashboardLayoutContext } from '../../contexts/DashboardLayoutContext';

const getLinkClassName = ({ isActive }: { isActive: boolean }): string => {
  const baseClass =
    'py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform text-center block';
  const activeClass =
    'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]';
  const inactiveClass =
    'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]';

  return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
};

export const DrawerNavigation = (): JSX.Element => {
  const { canManageTeam } = useDashboardLayoutContext();

  return (
    <div className="glass-strong rounded-3xl shadow-glow-lg p-4 lg:p-6 mb-6 animate-fade-in-up">
      <div
        className={`grid gap-3 lg:gap-4 ${
          canManageTeam
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        <NavLink to="/dashboard/personal" className={getLinkClassName}>
          📝 Personal
        </NavLink>
        <NavLink to="/dashboard/repositories" className={getLinkClassName}>
          📦 Repositories
        </NavLink>
        <NavLink to="/dashboard/tasks" className={getLinkClassName}>
          ✅ Tasks
        </NavLink>
        {canManageTeam && (
          <NavLink to="/dashboard/management" className={getLinkClassName}>
            ⚙️ Yönetim
          </NavLink>
        )}
      </div>
    </div>
  );
};
