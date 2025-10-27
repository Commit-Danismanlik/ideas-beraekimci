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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial"></div>
        <div className="absolute inset-0 bg-gradient-mesh"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-purple-600/20" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  const hasTeam = userTeams.length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Professional Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950"></div>
        
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-700/30 to-transparent animate-gradient-shift"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-purple-700/30 to-transparent animate-gradient-shift reverse"></div>
        </div>


        {/* Elegant Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
          <defs>
            <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="url(#grid-gradient)" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Light Rays */}
        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent animate-beam"></div>
        <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/40 to-transparent animate-beam delay-2000"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-beam delay-4000"></div>

        {/* Subtle Particles */}
        <div className="absolute top-20 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-twinkle shadow-lg shadow-indigo-400/50"></div>
        <div className="absolute top-40 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-twinkle delay-1000 shadow-lg shadow-purple-400/50"></div>
        <div className="absolute bottom-32 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-twinkle delay-2000 shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute top-60 right-1/2 w-2 h-2 bg-pink-400 rounded-full animate-twinkle delay-3000 shadow-lg shadow-pink-400/50"></div>
        <div className="absolute bottom-40 left-1/5 w-2 h-2 bg-blue-400 rounded-full animate-twinkle delay-4000 shadow-lg shadow-blue-400/50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header */}
        <div className="glass-strong border-b border-indigo-500/20 shadow-glow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo ve Başlık */}
            <div className="flex items-center gap-2 lg:gap-4">
              <img src="/gbtalks_row.svg" alt="GBTalks Logo" className="h-8 lg:h-12 drop-shadow-lg" />
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-sm lg:text-base text-indigo-300/70 hidden lg:block">Hoş geldin, {user?.displayName || user?.email}</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
              >
                👤 Profil
              </button>
              <button
                onClick={() => {
                  setActiveView('myteam');
                  setIsMobileMenuOpen(false);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
              >
                👥 Takımım
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
              >
                Çıkış Yap
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-slate-800 transition-all duration-300"
              aria-label="Menu"
            >
              <div className={`w-8 h-8 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
                {isMobileMenuOpen ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </div>
            </button>
          </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="mt-4 pb-4 border-t border-indigo-500/20">
                <div className="flex flex-col gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${
                      isMobileMenuOpen ? 'animate-fade-in-up delay-100' : ''
                    }`}
                  >
                    👤 Profil
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('myteam');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${
                      isMobileMenuOpen ? 'animate-fade-in-up delay-200' : ''
                    }`}
                  >
                    👥 Takımım
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${
                      isMobileMenuOpen ? 'animate-fade-in-up delay-300' : ''
                    }`}
                  >
                    Çıkış Yap
                  </button>
                  <div className={`pt-2 text-sm text-indigo-300/70 px-4 ${
                    isMobileMenuOpen ? 'animate-fade-in delay-400' : ''
                  }`}>
                    Hoş geldin, {user?.displayName || user?.email}
                  </div>
                </div>
              </div>
            </div>

          <style>{`
            @keyframes fade-in-up {
              0% {
                opacity: 0;
                transform: translateY(-10px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fade-in {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }

            .animate-fade-in-up {
              animation: fade-in-up 0.3s ease-out;
            }

            .animate-fade-in {
              animation: fade-in 0.3s ease-out;
            }

            .delay-100 {
              animation-delay: 0.05s;
            }

            .delay-200 {
              animation-delay: 0.1s;
            }

            .delay-300 {
              animation-delay: 0.15s;
            }

            .delay-400 {
              animation-delay: 0.2s;
            }
          `}</style>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 lg:py-20">
        {/* Toggle Buttons - Permission bazlı görünüm */}
        <div className="glass-strong rounded-3xl shadow-glow-lg p-4 lg:p-6 mb-6 animate-fade-in-up">
          <div className={`grid gap-3 lg:gap-4 ${canManageTeam ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            <button
              onClick={() => setActiveView('personal')}
              className={`py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform ${
                activeView === 'personal'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]'
                  : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]'
              }`}
            >
              📝 Personal
            </button>
            <button
              onClick={() => setActiveView('repositories')}
              className={`py-4 lg:py-6 px-4 rounded-2xl font-bold text-base sm:text-xl lg:text-2xl transition-all duration-300 transform ${
                activeView === 'repositories'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow-lg scale-[1.02]'
                  : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-[1.02]'
              }`}
            >
              📦 Repositories
            </button>
            <button
              onClick={() => setActiveView('tasks')}
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
                onClick={() => setActiveView('management')}
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

        {/* Active View Content */}
        <div className="glass-strong rounded-3xl shadow-glow-lg p-4 sm:p-6 animate-fade-in-scale">
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

      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 80%;
          }
        }

        @keyframes beam {
          0% {
            opacity: 0;
            transform: translateY(-200%) scaleY(1);
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1.5);
          }
          50% {
            opacity: 1;
            transform: scale(2.5);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 0.2s ease infinite;
        }

        .animate-beam {
          animation: beam 4s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.05s;
        }

        .delay-200 {
          animation-delay: 0.1s;
        }

        .delay-300 {
          animation-delay: 0.15s;
        }

        .delay-400 {
          animation-delay: 0.2s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }

        .delay-3000 {
          animation-delay: 3s;
        }

        .delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

