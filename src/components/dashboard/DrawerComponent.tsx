import { NavLink } from 'react-router-dom';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
import { useDashboardLayoutContext } from '../../contexts/DashboardLayoutContext';
import { IconButtonWithTooltip } from '../ui/IconButtonWithTooltip';

const getLinkClassName = ({ isActive }: { isActive: boolean }): string => {
  const baseClass =
    'flex items-center gap-3 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 block w-full text-left';
  const activeClass =
    'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow border border-indigo-400/30';
  const inactiveClass =
    'text-indigo-200/90 hover:text-white hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/20';

  return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
};

const MENU_ITEMS: Array<{
  to: string;
  label: string;
  icon: string;
  requiresManageTeam?: boolean;
}> = [
    { to: '/dashboard/personal', label: 'Personal', icon: '📝' },
    { to: '/dashboard/repositories', label: 'Repositories', icon: '📦' },
    { to: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
    {
      to: '/dashboard/management',
      label: 'Yönetim',
      icon: '⚙️',
      requiresManageTeam: true,
    },
  ];

export const DrawerComponent = (): JSX.Element => {
  const { canManageTeam } = useDashboardLayoutContext();

  const visibleMenuItems = MENU_ITEMS.filter(
    (item) => !item.requiresManageTeam || canManageTeam
  );

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <IconButtonWithTooltip
          onClick={() => { }}
          tooltip="Menü"
          className="w-full lg:w-10 h-10 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center"
          ariaLabel="Menüyü aç"
        >
          ☰
        </IconButtonWithTooltip>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[280px] sm:w-[320px] min-w-0 flex flex-col glass-strong border-r border-indigo-500/20 rounded-r-2xl">
        <DrawerHeader className="border-b border-indigo-500/20 pb-4">
          <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Dashboard Menü
          </DrawerTitle>
        </DrawerHeader>
        <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
          {visibleMenuItems.map((item) => (
            <DrawerClose asChild key={item.to}>
              <NavLink to={item.to} className={getLinkClassName}>
                <span>{item.label}</span>
              </NavLink>
            </DrawerClose>
          ))}
        </nav>
        <div className="h-10 pl-3 pt-0 border-t border-indigo-500/10 flex items-center ">
          <p className="text-xs text-indigo-300/50"> Copyright © 2026 GP Talks</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
