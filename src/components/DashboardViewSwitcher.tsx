import { ViewType } from '../hooks/useDashboard';
import { ITeam } from '../models/Team.model';
import { TasksView } from './TasksView';
import { RepositoriesView } from './RepositoriesView';
import { PersonalRepositoriesView } from './PersonalRepositoriesView';
import { TeamManagement } from './TeamManagement';
import { NoTeamWarning } from './NoTeamWarning';
import { MyTeam } from './MyTeam';

interface DashboardViewSwitcherProps {
  activeView: ViewType;
  hasTeam: boolean;
  userTeams: ITeam[];
  onTeamChange: () => void;
}

export const DashboardViewSwitcher = ({
  activeView,
  hasTeam,
  userTeams,
  onTeamChange,
}: DashboardViewSwitcherProps): JSX.Element => {
  return (
    <div className="glass-strong rounded-3xl shadow-glow-lg p-4 sm:p-6 animate-fade-in-scale">
      {activeView === 'personal' && <PersonalRepositoriesView />}

      {activeView === 'repositories' &&
        (hasTeam ? (
          <RepositoriesView userTeams={userTeams} />
        ) : (
          <NoTeamWarning onTeamChange={onTeamChange} />
        ))}

      {activeView === 'tasks' &&
        (hasTeam ? (
          <TasksView userTeams={userTeams} />
        ) : (
          <NoTeamWarning onTeamChange={onTeamChange} />
        ))}

      {activeView === 'management' &&
        (hasTeam ? (
          <TeamManagement userTeams={userTeams} />
        ) : (
          <NoTeamWarning onTeamChange={onTeamChange} />
        ))}

      {activeView === 'myteam' && <MyTeam onTeamChange={onTeamChange} />}
    </div>
  );
};

