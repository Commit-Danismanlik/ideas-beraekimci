/**
 * DashboardLoading Component
 * SOLID: Single Responsibility - Sadece loading state'inden sorumlu
 */
export const DashboardLoading = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial"></div>
      <div className="absolute inset-0 bg-gradient-mesh"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600"></div>
          <div
            className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-purple-600/20"
            style={{ animationDirection: 'reverse' }}
          ></div>
        </div>
        <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Yükleniyor...
        </p>
      </div>
    </div>
  );
};

