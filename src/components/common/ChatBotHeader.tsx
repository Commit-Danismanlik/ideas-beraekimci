export interface ChatBotHeaderProps {
  onClose: () => void;
}

export const ChatBotHeader = ({ onClose }: ChatBotHeaderProps): JSX.Element => {
  return (
    <div className="flex justify-between items-center p-4 sm:p-6 border-b border-indigo-500/20">
      <div className="flex items-center gap-3">
        <img
          src="/gemini-color.svg"
          alt="Gemini"
          className="w-8 h-8 sm:w-10 sm:h-10"
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
  );
};
