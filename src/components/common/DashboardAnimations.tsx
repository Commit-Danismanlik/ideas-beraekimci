/**
 * DashboardAnimations Component
 * SOLID: Single Responsibility - Sadece animasyon stillerinden sorumlu
 */
export const DashboardAnimations = (): JSX.Element => {
  return (
    <style>{`
      @keyframes fade-in-up {
        0% {
          opacity: 0;
          transform: translateY(-20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fade-in {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes gradient-shift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 80%;
        }
      }

      @keyframes beam {
        0% {
          opacity: 0;
          transform: translateY(-200%) scaleY(1);
        }
        10% {
          opacity: 0.8;
        }
        90% {
          opacity: 0.8;
        }
        100% {
          opacity: 0;
          transform: translateY(0) scaleY(1);
        }
      }

      @keyframes twinkle {
        0%, 100% {
          opacity: 0.8;
          transform: scale(1.5);
        }
        50% {
          opacity: 1;
          transform: scale(2.5);
        }
      }

      .animate-fade-in-up {
        animation: fade-in-up 0.3s ease-out;
      }

      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }

      .animate-gradient-shift {
        background-size: 200% 200%;
        animation: gradient-shift 0.2s ease infinite;
      }

      .animate-beam {
        animation: beam 4s ease-in-out infinite;
      }

      .animate-twinkle {
        animation: twinkle 3s ease-in-out infinite;
      }

      .delay-100 {
        animation-delay: 0.05s;
      }

      .delay-200 {
        animation-delay: 0.1s;
      }

      .delay-300 {
        animation-delay: 0.15s;
      }

      .delay-400 {
        animation-delay: 0.2s;
      }

      .delay-1000 {
        animation-delay: 1s;
      }

      .delay-2000 {
        animation-delay: 2s;
      }

      .delay-3000 {
        animation-delay: 3s;
      }

      .delay-4000 {
        animation-delay: 4s;
      }
    `}</style>
  );
};

