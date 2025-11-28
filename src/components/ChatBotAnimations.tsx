export const ChatBotAnimations = (): JSX.Element => {
  return (
    <style>{`
      @keyframes fade-in {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes fade-in-up {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes dot-bounce {
        0%, 80%, 100% {
          opacity: 0.3;
          transform: translateY(0);
        }
        40% {
          opacity: 1;
          transform: translateY(-8px);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }

      .animate-fade-in-up {
        animation: fade-in-up 0.3s ease-out;
      }

      .animate-dot-1 {
        animation: dot-bounce 1.4s infinite;
      }

      .animate-dot-2 {
        animation: dot-bounce 1.4s infinite;
        animation-delay: 0.2s;
      }

      .animate-dot-3 {
        animation: dot-bounce 1.4s infinite;
        animation-delay: 0.4s;
      }

      .delay-100 {
        animation-delay: 0.1s;
      }

      .delay-200 {
        animation-delay: 0.2s;
      }
    `}</style>
  );
};

