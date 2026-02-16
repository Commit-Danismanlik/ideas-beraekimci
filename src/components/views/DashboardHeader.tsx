import { useAuthContext } from '../../contexts/AuthContext';
import { User, Users, LogOut, Menu, X } from 'lucide-react';
import { DrawerComponent } from '../dashboard/DrawerComponent';
import { IconButtonWithTooltip } from '../ui/IconButtonWithTooltip';

interface DashboardHeaderProps {
  onLogout: () => Promise<void>;
  onShowProfile: () => void;
  onShowChatBot: () => void;
  onShowMyTeam: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const iconButtonSize = 'h-10 w-10';

export const DashboardHeader = ({
  onLogout,
  onShowProfile,
  onShowChatBot,
  onShowMyTeam,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: DashboardHeaderProps): JSX.Element => {
  const { user } = useAuthContext();

  const iconButtonBase =
    `${iconButtonSize} flex items-center justify-center rounded-xl text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900`;

  const primaryButton = `${iconButtonBase} bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/40`;
  const logoutButton = `${iconButtonBase} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/40`;

  return (
    <header className="glass-strong border-b border-indigo-500/20 shadow-glow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo ve Başlık */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <img
              src="/gbtalks_row.svg"
              alt="GBTalks Logo"
              className="h-8 lg:h-10 shrink-0 drop-shadow-lg"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent truncate">
                Dashboard
              </h1>
              <p className="text-xs lg:text-sm text-indigo-300/70 hidden lg:block truncate">
                Hoş geldin, {user?.displayName || user?.email}
              </p>
            </div>
          </div>

          {/* Desktop: yalnızca ikon butonlar + tooltip */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <DrawerComponent />
            <IconButtonWithTooltip
              onClick={onShowChatBot}
              tooltip="ChatBot"
              className={primaryButton}
              ariaLabel="ChatBot'u aç"
            >
              <img
                src="/gemini-color.svg"
                alt=""
                className="w-5 h-5"
                aria-hidden
              />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
              onClick={onShowProfile}
              tooltip="Profil"
              className={primaryButton}
              ariaLabel="Profil"
            >
              <User className="w-5 h-5" strokeWidth={2} aria-hidden />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
              onClick={onShowMyTeam}
              tooltip="Takımım"
              className={primaryButton}
              ariaLabel="Takımım"
            >
              <Users className="w-5 h-5" strokeWidth={2} aria-hidden />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
              onClick={onLogout}
              tooltip="Çıkış Yap"
              className={logoutButton}
              ariaLabel="Çıkış yap"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} aria-hidden />
            </IconButtonWithTooltip>
          </div>

          {/* Mobil menü butonu */}
          <div className="lg:hidden">
            <IconButtonWithTooltip
              onClick={onToggleMobileMenu}
              tooltip={isMobileMenuOpen ? 'Menüyü kapat' : 'Menü'}
              className={`${iconButtonSize} flex items-center justify-center rounded-xl text-white hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900`}
              ariaLabel={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              ariaExpanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={2} aria-hidden />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} aria-hidden />
              )}
            </IconButtonWithTooltip>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="mt-4 pb-4 border-t border-indigo-500/20">
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  onShowChatBot();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] flex items-center gap-2 ${isMobileMenuOpen ? 'animate-fade-in-up delay-100' : ''
                  }`}
              >
                <img
                  src="/gemini-color.svg"
                  alt="Gemini"
                  className="w-5 h-5"
                />
                ChatBot
              </button>
              <button
                onClick={() => {
                  onShowProfile();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${isMobileMenuOpen ? 'animate-fade-in-up delay-200' : ''
                  }`}
              >
                👤 Profil
              </button>
              <button
                onClick={() => {
                  onShowMyTeam();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${isMobileMenuOpen ? 'animate-fade-in-up delay-200' : ''
                  }`}
              >
                👥 Takımım
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${isMobileMenuOpen ? 'animate-fade-in-up delay-400' : ''
                  }`}
              >
                Çıkış Yap
              </button>
              <div
                className={`pt-2 text-sm text-indigo-300/70 px-4 ${isMobileMenuOpen ? 'animate-fade-in delay-500' : ''
                  }`}
              >
                Hoş geldin, {user?.displayName || user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

