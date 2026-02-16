import { useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardHeader } from '../components/views/DashboardHeader';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { DashboardViewSwitcher } from '../components/dashboard/DashboardViewSwitcher';
import { DashboardLoading } from '../components/dashboard/DashboardLoading';
import { DashboardAnimations } from '../components/dashboard/DashboardAnimations';
import { ProfileModal } from '../components/views/ProfileModal';
import { ChatBot } from '../components/views/ChatBot';

/**
 * Dashboard Component
 * SOLID: Single Responsibility - Sadece component composition'ından sorumlu
 * Composition Pattern - Küçük componentleri birleştirir
 */
export const Dashboard = (): JSX.Element => {
  const {
    userTeams,
    activeView,
    loading,
    showProfileModal,
    showChatBot,
    isMobileMenuOpen,
    hasTeam,
    selectedTeamId,
    setActiveView,
    setShowProfileModal,
    setShowChatBot,
    setIsMobileMenuOpen,
    handleLogout,
    handleTeamChange,
  } = useDashboard();

  // TeamManagement sayfasına yönlendirme event listener
  useEffect(() => {
    const handleNavigateToTeamManagement = (): void => {
      setActiveView('management');
      setShowChatBot(false);
    };

    window.addEventListener('navigateToTeamManagement', handleNavigateToTeamManagement);
    return () => {
      window.removeEventListener('navigateToTeamManagement', handleNavigateToTeamManagement);
    };
  }, [setActiveView, setShowChatBot]);

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <DashboardBackground />

      {/* Content Container */}
      <div className="relative z-10">
        <DashboardHeader
          onLogout={handleLogout}
          onShowProfile={() => setShowProfileModal(true)}
          onShowChatBot={() => setShowChatBot(true)}
          onShowMyTeam={() => setActiveView('myteam')}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-20">
          <DashboardViewSwitcher
            activeView={activeView}
            hasTeam={hasTeam}
            userTeams={userTeams}
            onTeamChange={handleTeamChange}
          />
        </div>
      </div>

      {/* Modals */}
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
  );
};
