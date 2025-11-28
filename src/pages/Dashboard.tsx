import { useDashboard } from '../hooks/useDashboard';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardBackground } from '../components/DashboardBackground';
import { DashboardNavigation } from '../components/DashboardNavigation';
import { DashboardViewSwitcher } from '../components/DashboardViewSwitcher';
import { DashboardLoading } from '../components/DashboardLoading';
import { DashboardAnimations } from '../components/DashboardAnimations';
import { ProfileModal } from '../components/ProfileModal';
import { ChatBot } from '../components/ChatBot';

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
    canManageTeam,
    hasTeam,
    setActiveView,
    setShowProfileModal,
    setShowChatBot,
    setIsMobileMenuOpen,
    handleLogout,
    handleTeamChange,
  } = useDashboard();

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
          <DashboardNavigation
            activeView={activeView}
            canManageTeam={canManageTeam}
            onViewChange={setActiveView}
          />

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
      />

      <DashboardAnimations />
    </div>
  );
};
