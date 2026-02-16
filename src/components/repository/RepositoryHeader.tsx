import { ITeam } from '../../models/Team.model';

interface RepositoryHeaderProps {
  userTeams: ITeam[];
  selectedTeam: string;
  onTeamChange: (teamId: string) => void;
  selectedTeamData?: ITeam;
  canViewTeamId: boolean;
  onCopyTeamId: (teamId: string) => void;
}

/**
 * RepositoryHeader Component
 * SOLID: Single Responsibility - Sadece header ve takım seçiminden sorumlu
 */
export const RepositoryHeader = ({
  userTeams,
  selectedTeam,
  onTeamChange,
  selectedTeamData,
  canViewTeamId,
  onCopyTeamId,
}: RepositoryHeaderProps): JSX.Element => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Team Repositories
        </h2>

        {userTeams.length > 1 && (
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="px-4 py-2 glass border border-indigo-500/30 rounded-xl text-indigo-200 focus:ring-2 focus:ring-indigo-500 transition-all hover:border-indigo-400"
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
        <div className="mb-6 p-4 glass rounded-2xl border border-indigo-500/20 shadow-glow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-indigo-200">{selectedTeamData.name}</h3>
              <p className="text-sm text-indigo-300/70">
                {selectedTeamData.description || 'Açıklama yok'}
              </p>
            </div>
            {canViewTeamId && (
              <div className="text-right">
                <p className="text-xs text-indigo-300/50 mb-1">Takım ID</p>
                <div className="flex items-center gap-2 justify-end">
                  <code className="text-sm font-mono glass px-2 py-1 rounded-lg border border-indigo-500/30 text-indigo-300">
                    {selectedTeamData.id}
                  </code>
                  <button
                    onClick={() => onCopyTeamId(selectedTeamData.id)}
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 p-2 rounded-lg border border-indigo-500/30 transition-all hover:border-indigo-400 transform hover:scale-105"
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
