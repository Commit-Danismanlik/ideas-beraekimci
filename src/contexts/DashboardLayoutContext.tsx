import { createContext, useContext, ReactNode } from 'react';
import { ITeam } from '../models/Team.model';

interface IDashboardLayoutContext {
  userTeams: ITeam[];
  hasTeam: boolean;
  canManageTeam: boolean;
  onTeamChange: () => void;
}

const DashboardLayoutContext = createContext<IDashboardLayoutContext | undefined>(undefined);

interface DashboardLayoutProviderProps {
  children: ReactNode;
  value: IDashboardLayoutContext;
}

export const DashboardLayoutProvider = ({
  children,
  value,
}: DashboardLayoutProviderProps): JSX.Element => {
  return (
    <DashboardLayoutContext.Provider value={value}>
      {children}
    </DashboardLayoutContext.Provider>
  );
};

export const useDashboardLayoutContext = (): IDashboardLayoutContext => {
  const context = useContext(DashboardLayoutContext);
  if (context === undefined) {
    throw new Error(
      'useDashboardLayoutContext must be used within a DashboardLayoutProvider'
    );
  }
  return context;
};
