import { ITeam } from '../models/Team.model';

interface TaskHeaderProps {
  userTeams: ITeam[];
  selectedTeam: string;
  onTeamChange: (teamId: string) => void;
  selectedTeamData?: ITeam;
  canViewTeamId: boolean;
  onCopyTeamId: (teamId: string) => void;
}

/**
 * TaskHeader Component
 * SOLID: Single Responsibility - Sadece header ve takım seçiminden sorumlu
 */
export const TaskHeader = ({
  userTeams,
  selectedTeam,
  onTeamChange,
  selectedTeamData,
  canViewTeamId,
  onCopyTeamId,
}: TaskHeaderProps): JSX.Element => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Görevler</h2>

        {/* Team Selector */}
        {userTeams.length > 1 && (
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
          >
            {userTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedTeamData && (
        <div className="mb-6 p-4 bg-indigo-950 border border-indigo-900 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-indigo-200">{selectedTeamData.name}</h3>
              <p className="text-sm text-indigo-300">
                {selectedTeamData.description || 'Açıklama yok'}
              </p>
            </div>
            {canViewTeamId && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Takım ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-gray-800 px-2 py-1 rounded border border-indigo-700 text-indigo-300">
                    {selectedTeamData.id}
                  </code>
                  <button
                    onClick={() => onCopyTeamId(selectedTeamData.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1 rounded border border-gray-300"
                    title="Takım ID'sini kopyala"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

