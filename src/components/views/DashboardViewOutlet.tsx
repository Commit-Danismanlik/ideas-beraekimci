import { useParams, Navigate } from 'react-router-dom';
import { ViewType } from '../../hooks/useDashboard';
import { useDashboardLayoutContext } from '../../contexts/DashboardLayoutContext';
import { TasksView } from './TasksView';
import { RepositoriesView } from './RepositoriesView';
import { PersonalRepositoriesView } from './PersonalRepositoriesView';
import { TeamManagement } from './TeamManagement';
import { NoTeamWarning } from './NoTeamWarning';
import { MyTeam } from './MyTeam';

const VALID_VIEWS: ViewType[] = [
  'personal',
  'repositories',
  'tasks',
  'management',
  'myteam',
];

const isValidView = (view: string | undefined): view is ViewType =>
  view !== undefined && VALID_VIEWS.includes(view as ViewType);

export const DashboardViewOutlet = (): JSX.Element => {
  const { view } = useParams<{ view: string }>();

  if (!isValidView(view)) {
    return <Navigate to="/dashboard/personal" replace />;
  }
  const { userTeams, hasTeam, onTeamChange } = useDashboardLayoutContext();

  switch (view) {
    case 'personal':
      return <PersonalRepositoriesView />;

    case 'repositories':
      return hasTeam ? (
        <RepositoriesView userTeams={userTeams} />
      ) : (
        <NoTeamWarning onTeamChange={onTeamChange} />
      );

    case 'tasks':
      return hasTeam ? (
        <TasksView userTeams={userTeams} />
      ) : (
        <NoTeamWarning onTeamChange={onTeamChange} />
      );

    case 'management':
      return hasTeam ? (
        <TeamManagement userTeams={userTeams} />
      ) : (
        <NoTeamWarning onTeamChange={onTeamChange} />
      );

    case 'myteam':
      return <MyTeam onTeamChange={onTeamChange} />;

    default:
      return <PersonalRepositoriesView />;
  }
};
