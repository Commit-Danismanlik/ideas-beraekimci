import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { getTeamService } from '../di/container';
import { ITeam } from '../models/Team.model';
import { TasksView } from '../components/TasksView';
import { RepositoriesView } from '../components/RepositoriesView';
import { PersonalRepositoriesView } from '../components/PersonalRepositoriesView';
import { TeamManagement } from '../components/TeamManagement';
import { NoTeamWarning } from '../components/NoTeamWarning';
import { MyTeam } from '../components/MyTeam';
import { ProfileModal } from '../components/ProfileModal';

type ViewType = 'repositories' | 'tasks' | 'personal' | 'management' | 'myteam';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [activeView, setActiveView] = useState<ViewType>('personal');
  const [userTeams, setUserTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const teamService = getTeamService();
  
  // İlk takım için permission kontrolü
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { hasPermission } = usePermissions(selectedTeamId);
  
  // Yönetim sayfasını görebilir mi?
  // Owner ise veya MANAGE_ROLES/MANAGE_MEMBERS yetkisi varsa gösterilir
  const isOwnerOfAnyTeam = userTeams.some((team) => team.ownerId === user?.uid);
  const canManageTeam = isOwnerOfAnyTeam || hasPermission('MANAGE_ROLES') || hasPermission('MANAGE_MEMBERS');
  
  console.log('canManageTeam:', canManageTeam, 'isOwner:', isOwnerOfAnyTeam, 'permissions:', hasPermission('MANAGE_ROLES'));

  useEffect(() => {
    const fetchUserTeams = async () => {
      if (user) {
        setLoading(true);
        const result = await teamService.getUserTeams(user.uid);
        if (result.success) {
          setUserTeams(result.data);
          // İlk takımı seç (permission kontrolü için)
          if (result.data.length > 0) {
            setSelectedTeamId(result.data[0].id);
          }
        }
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTeamChange = () => {
    // Takım değişikliğinden sonra yeniden fetch
    if (user) {
      teamService.getUserTeams(user.uid).then((result) => {
        if (result.success) {
          setUserTeams(result.data);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-black to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  const hasTeam = userTeams.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/gbtalks_row.svg" alt="GBTalks Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
                <p className="text-gray-400">Hoş geldin, {user?.displayName || user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                👤 Profil
              </button>
              <button
                onClick={() => setActiveView('myteam')}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                👥 Takımım
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toggle Buttons - Permission bazlı görünüm */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className={`grid gap-4 ${canManageTeam ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <button
              onClick={() => setActiveView('personal')}
              className={`py-8 px-4 rounded-lg font-bold text-xl lg:text-2xl transition-all ${
                activeView === 'personal'
                  ? 'bg-indigo-700 text-white shadow-xl scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              📝 Personal
            </button>
            <button
              onClick={() => setActiveView('repositories')}
              className={`py-8 px-4 rounded-lg font-bold text-xl lg:text-2xl transition-all ${
                activeView === 'repositories'
                  ? 'bg-indigo-700 text-white shadow-xl scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              📦 Repositories
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className={`py-8 px-4 rounded-lg font-bold text-xl lg:text-2xl transition-all ${
                activeView === 'tasks'
                  ? 'bg-indigo-700 text-white shadow-xl scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ✅ Tasks
            </button>
            {canManageTeam && (
              <button
                onClick={() => setActiveView('management')}
                className={`py-8 px-4 rounded-lg font-bold text-xl lg:text-2xl transition-all ${
                  activeView === 'management'
                    ? 'bg-indigo-700 text-white shadow-xl scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                ⚙️ Yönetim
              </button>
            )}
          </div>
        </div>

        {/* Active View Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
          {activeView === 'personal' && <PersonalRepositoriesView />}
          
          {activeView === 'repositories' && (
            hasTeam ? (
              <RepositoriesView userTeams={userTeams} />
            ) : (
              <NoTeamWarning onTeamChange={handleTeamChange} />
            )
          )}
          
          {activeView === 'tasks' && (
            hasTeam ? (
              <TasksView userTeams={userTeams} />
            ) : (
              <NoTeamWarning onTeamChange={handleTeamChange} />
            )
          )}
          
          {activeView === 'management' && (
            hasTeam ? (
              <TeamManagement userTeams={userTeams} />
            ) : (
              <NoTeamWarning onTeamChange={handleTeamChange} />
            )
          )}

          {activeView === 'myteam' && (
            <MyTeam onTeamChange={handleTeamChange} />
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
};

