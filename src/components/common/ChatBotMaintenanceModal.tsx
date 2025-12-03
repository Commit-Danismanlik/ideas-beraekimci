interface ChatBotMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBotMaintenanceModal = ({ isOpen, onClose }: ChatBotMaintenanceModalProps): JSX.Element | null => {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="glass-strong rounded-2xl sm:rounded-3xl w-full max-w-md shadow-glow-lg border border-indigo-500/20 animate-fade-in-up flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <img
                src="/gemini-color.svg"
                alt="Gemini"
                className="w-8 h-8 sm:w-10 sm:h-10 opacity-50"
              />
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                ChatBot
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                <svg
                  className="w-12 h-12 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-200 mb-4">
              Şu Anlık Bakımda
            </h2>

            <p className="text-indigo-300/80 text-sm sm:text-base leading-relaxed max-w-sm">
              ChatBot şu anda bakım modunda. Yakında tekrar hizmetinizde olacağız.
            </p>

            <button
              onClick={onClose}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/50"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

