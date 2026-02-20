import { ITeam } from '../../models/Team.model';
import { MdContentCopy } from "react-icons/md";


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
    <div className="flex flex-col gap-y-2 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent truncate">
          Team Repositories
        </h2>

        {userTeams.length > 1 && (
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="w-full sm:w-auto min-w-0 px-4 py-2 glass rounded-xl text-indigo-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
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
        <div className="min-w-0">
          <div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-indigo-200 truncate">{selectedTeamData.name}</h3>
              <p className="text-xs sm:text-sm text-indigo-300/70 line-clamp-2">
                {selectedTeamData.description || 'Açıklama yok'}
              </p>
            </div>
            {canViewTeamId && (
              <div className="mt-2">
                <p className="text-xs text-indigo-300/50">Takım ID</p>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="text-xs sm:text-sm font-mono py-1 px-2 rounded-lg text-indigo-300 truncate max-w-full block">
                    {selectedTeamData.id}
                  </code>
                  <button
                    onClick={() => onCopyTeamId(selectedTeamData.id)}
                    className=" rounded-lg transition-all transform hover:scale-105"
                    title="Takım ID'sini kopyala"
                  >
                    <MdContentCopy />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
