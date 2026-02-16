/**
 * DashboardBackground Component
 * SOLID: Single Responsibility - Sadece background animasyonlarından sorumlu
 */
export const DashboardBackground = (): JSX.Element => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950"></div>

      {/* Animated Gradient Mesh */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-700/30 to-transparent animate-gradient-shift"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-purple-700/30 to-transparent animate-gradient-shift reverse"></div>
      </div>

      {/* Elegant Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <defs>
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="url(#grid-gradient)"
            strokeWidth="1"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Light Rays */}
      <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent animate-beam"></div>
      <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/40 to-transparent animate-beam delay-2000"></div>
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-beam delay-4000"></div>

      {/* Subtle Particles */}
      <div className="absolute top-20 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-twinkle shadow-lg shadow-indigo-400/50"></div>
      <div className="absolute top-40 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-twinkle delay-1000 shadow-lg shadow-purple-400/50"></div>
      <div className="absolute bottom-32 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-twinkle delay-2000 shadow-lg shadow-cyan-400/50"></div>
      <div className="absolute top-60 right-1/2 w-2 h-2 bg-pink-400 rounded-full animate-twinkle delay-3000 shadow-lg shadow-pink-400/50"></div>
      <div className="absolute bottom-40 left-1/5 w-2 h-2 bg-blue-400 rounded-full animate-twinkle delay-4000 shadow-lg shadow-blue-400/50"></div>
    </div>
  );
};
