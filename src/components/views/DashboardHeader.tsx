import { useAuthContext } from '../../contexts/AuthContext';

interface DashboardHeaderProps {
  onLogout: () => Promise<void>;
  onShowProfile: () => void;
  onShowChatBot: () => void;
  onShowMyTeam: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const DashboardHeader = ({
  onLogout,
  onShowProfile,
  onShowChatBot,
  onShowMyTeam,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: DashboardHeaderProps): JSX.Element => {
  const { user } = useAuthContext();

  return (
    <div className="glass-strong border-b border-indigo-500/20 shadow-glow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo ve Başlık */}
          <div className="flex items-center gap-2 lg:gap-4">
            <img
              src="/gbtalks_row.svg"
              alt="GBTalks Logo"
              className="h-8 lg:h-12 drop-shadow-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm lg:text-base text-indigo-300/70 hidden lg:block">
                Hoş geldin, {user?.displayName || user?.email}
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-3">
            <button
              onClick={onShowChatBot}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 flex items-center gap-2"
            >
              <img
                src="/gemini-color.svg"
                alt="Gemini"
                className="w-5 h-5"
              />
              ChatBot
            </button>
            <button
              onClick={onShowProfile}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
            >
              👤 Profil
            </button>
            <button
              onClick={onShowMyTeam}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
            >
              👥 Takımım
            </button>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-slate-800 transition-all duration-300"
            aria-label="Menu"
          >
            <div
              className={`w-8 h-8 transition-transform duration-300 ${
                isMobileMenuOpen ? 'rotate-90' : ''
              }`}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mt-4 pb-4 border-t border-indigo-500/20">
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  onShowChatBot();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] flex items-center gap-2 ${
                  isMobileMenuOpen ? 'animate-fade-in-up delay-100' : ''
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
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${
                  isMobileMenuOpen ? 'animate-fade-in-up delay-200' : ''
                }`}
              >
                👤 Profil
              </button>
              <button
                onClick={() => {
                  onShowMyTeam();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${
                  isMobileMenuOpen ? 'animate-fade-in-up delay-200' : ''
                }`}
              >
                👥 Takımım
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onToggleMobileMenu();
                }}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow text-left transform hover:scale-[1.02] ${
                  isMobileMenuOpen ? 'animate-fade-in-up delay-400' : ''
                }`}
              >
                Çıkış Yap
              </button>
              <div
                className={`pt-2 text-sm text-indigo-300/70 px-4 ${
                  isMobileMenuOpen ? 'animate-fade-in delay-500' : ''
                }`}
              >
                Hoş geldin, {user?.displayName || user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

