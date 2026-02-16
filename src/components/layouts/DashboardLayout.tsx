import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardLayoutProvider } from '../../contexts/DashboardLayoutContext';
import { DashboardHeader } from '../views/DashboardHeader';
import { DashboardBackground } from '../dashboard/DashboardBackground';
import { DashboardLoading } from '../dashboard/DashboardLoading';
import { DashboardAnimations } from '../dashboard/DashboardAnimations';
import { ProfileModal } from '../views/ProfileModal';
import { ChatBot } from '../views/ChatBot';
/**
 * Dashboard Layout Component
 * Outlet pattern - Nested route içerikleri Outlet üzerinden render edilir
 * SOLID: Single Responsibility - Layout ve Outlet yönetiminden sorumlu
 */
export const DashboardLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    userTeams,
    loading,
    showProfileModal,
    showChatBot,
    isMobileMenuOpen,
    canManageTeam,
    hasTeam,
    selectedTeamId,
    setShowProfileModal,
    setShowChatBot,
    setIsMobileMenuOpen,
    handleLogout,
    handleTeamChange,
  } = useDashboard();

  useEffect(() => {
    const handleNavigateToTeamManagement = (): void => {
      navigate('/dashboard/management');
      setShowChatBot(false);
    };

    window.addEventListener('navigateToTeamManagement', handleNavigateToTeamManagement);
    return () => {
      window.removeEventListener(
        'navigateToTeamManagement',
        handleNavigateToTeamManagement
      );
    };
  }, [navigate, setShowChatBot]);

  if (loading) {
    return <DashboardLoading />;
  }

  const layoutContextValue = {
    userTeams,
    hasTeam,
    canManageTeam,
    onTeamChange: handleTeamChange,
  };

  return (
    <DashboardLayoutProvider value={layoutContextValue}>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <DashboardBackground />

        <div className="relative z-10">
          <DashboardHeader
            onLogout={handleLogout}
            onShowProfile={() => setShowProfileModal(true)}
            onShowChatBot={() => setShowChatBot(true)}
            onShowMyTeam={() => navigate('/dashboard/myteam')}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <div className="max-w-7xl mx-auto px-4 py-10 lg:py-20">
            <div className="glass-strong rounded-3xl shadow-glow-lg p-4 sm:p-6 animate-fade-in-scale">
              <Outlet />
            </div>
          </div>
        </div>

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />

        <ChatBot
          isOpen={showChatBot}
          onClose={() => setShowChatBot(false)}
          hasTeam={hasTeam}
          selectedTeamId={selectedTeamId}
        />

        <DashboardAnimations />
      </div>
    </DashboardLayoutProvider>
  );
};
