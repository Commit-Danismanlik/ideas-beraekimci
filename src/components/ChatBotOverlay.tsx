interface ChatBotOverlayProps {
  onClose: () => void;
}

export const ChatBotOverlay = ({ onClose }: ChatBotOverlayProps): JSX.Element => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
      onClick={handleOverlayClick}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

