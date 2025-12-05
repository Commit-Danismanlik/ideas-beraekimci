interface ChatBotMessageInputProps {
  inputMessage: string;
  isLoading: boolean;
  isTyping: boolean;
  onInputChange: (message: string) => void;
  onSend: () => void;
  onStop: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const ChatBotMessageInput = ({
  inputMessage,
  isLoading,
  isTyping,
  onInputChange,
  onSend,
  onStop,
  onKeyPress,
}: ChatBotMessageInputProps): JSX.Element => {
  const handleButtonClick = (): void => {
    if (isTyping) {
      onStop();
    } else {
      onSend();
    }
  };

  const getButtonText = (): string => {
    if (isLoading) {
      return '';
    }
    if (isTyping) {
      return 'Durdur';
    }
    return 'Gönder';
  };

  const isButtonDisabled = (): boolean => {
    if (isTyping) {
      return false;
    }
    return !inputMessage.trim() || isLoading;
  };

  return (
    <div className="p-4 sm:p-6 border-t border-indigo-500/20">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
        <textarea
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Mesajınızı yazın..."
          disabled={isLoading || isTyping}
          className="w-full sm:flex-1 glass rounded-xl p-3 sm:p-4 text-indigo-200 placeholder-indigo-400/50 border border-indigo-500/30 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <button
          onClick={handleButtonClick}
          disabled={isButtonDisabled()}
          className={`w-full sm:w-auto font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isTyping
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white hover:shadow-red-500/50'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/50'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            getButtonText()
          )}
        </button>
      </div>
    </div>
  );
};

