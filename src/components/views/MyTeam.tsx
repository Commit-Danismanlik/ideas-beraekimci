import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getTeamService, getTeamMemberInfoService } from '../../di/container';
import { ITeam } from '../../models/Team.model';
import { IMemberWithRole } from '../../services/TeamMemberInfoService';
import { ProfileModal } from './ProfileModal';
import { useModal } from '../../hooks/useModal';
import { useForm } from '../../hooks/useForm';

export const MyTeam = ({ onTeamChange }: { onTeamChange: () => void }) => {
  const { user } = useAuthContext();
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [members, setMembers] = useState<IMemberWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leaveConfirmModal = useModal(false);
  const profileEditModal = useModal(false);
  const confirmTeamNameForm = useForm({ teamName: '' });

  const openProfileEdit = () => {
    profileEditModal.open();
  };

  const teamService = getTeamService();
  const memberInfoService = getTeamMemberInfoService();

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await teamService.getUserTeams(user.uid);
      if (result.success) {
        setTeams(result.data);
        if (result.data.length > 0) {
          setSelectedTeam(result.data[0]);
          fetchTeamMembers(result.data[0].id);
        }
      }
    } catch (err) {
      setError('Takımlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    const team = teams.find((t) => t.id === teamId) || selectedTeam;
    if (!team) return;

    setLoading(true);
    try {
      const membersData = await memberInfoService.getMembersWithInfo(teamId, team.members);
      setMembers(membersData);
    } catch (err) {
      console.error('Üyeler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const handleLeaveTeam = async () => {
    if (!selectedTeam || !user) return;

    const isOwner = selectedTeam.ownerId === user.uid;

    // Owner ise confirm iste
    if (isOwner) {
      if (confirmTeamNameForm.formData.teamName !== selectedTeam.name) {
        alert('Takım adı eşleşmiyor');
        return;
      }
    }

    setLoading(true);
    try {
      const result = await teamService.leaveTeam(selectedTeam.id, user.uid);
      if (result.success) {
        setSelectedTeam(null);
        setMembers([]);
        fetchTeams();
        onTeamChange();
      } else {
        alert(result.error || 'Takımdan ayrılamadınız');
      }
    } catch (err) {
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
      leaveConfirmModal.close();
      confirmTeamNameForm.reset();
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-purple-600/20" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <p className="mt-4 text-indigo-300 font-semibold">Yükleniyor...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-3xl border border-indigo-500/20">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">Henüz Bir Takımınız Yok</h2>
        <p className="text-indigo-300/70 mb-6">Bir takıma katılmak veya yeni takım oluşturmak için dashboard'a dönün</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
        >
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  const isOwner = selectedTeam?.ownerId === user?.uid;

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-300 px-4 py-3 rounded-xl animate-fade-in-scale">
          {error}
        </div>
      )}

      {/* Takım Seçici */}
      {teams.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-indigo-200 mb-3">
            Takım Seç
          </label>
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const team = teams.find(t => t.id === e.target.value);
              if (team) setSelectedTeam(team);
            }}
            className="w-full sm:max-w-md px-4 py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all font-semibold text-sm sm:text-base"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Takım Bilgileri */}
      {selectedTeam && (
        <>
          <div className="mb-6 p-4 sm:p-6 glass rounded-2xl border border-indigo-500/20 shadow-glow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-100">{selectedTeam.name}</h2>
                <p className="text-indigo-300/70 mt-2 text-sm sm:text-base">{selectedTeam.description || 'Açıklama yok'}</p>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-indigo-300/80">
                  <span>👥 Üye Sayısı: {members.length}</span>
                  <span>📅 Oluşturulma: {new Date(selectedTeam.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div className="text-right self-start sm:self-end">
                <p className="text-xs text-indigo-300/50 mb-1 sm:mb-2">Takım ID</p>
                <code className="text-xs sm:text-sm font-mono glass px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-indigo-500/30 text-indigo-300 break-all">
                  {selectedTeam.id}
                </code>
              </div>
            </div>
          </div>

          {/* Üyeler */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">Takım Üyeleri</h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                  <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-purple-600/20" style={{ animationDirection: 'reverse' }}></div>
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl border border-indigo-500/20">
                <div className="text-5xl mb-3">👥</div>
                <p className="text-indigo-300 font-semibold">Henüz üye yok</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
                {members.map((member) => {
                  const isCurrentUser = member.userId === user?.uid;
                  const memberIsOwner = selectedTeam.ownerId === member.userId;

                  return (
                    <div
                      key={member.userId}
                      onClick={isCurrentUser ? openProfileEdit : undefined}
                      className={`p-3 sm:p-4 glass rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-glow ${
                        isCurrentUser
                          ? 'border-indigo-500/50 hover:border-indigo-400 hover:scale-[1.02]'
                          : 'border-indigo-500/20 hover:border-indigo-400/30'
                      }`}
                      title={isCurrentUser ? 'Bilgileri düzenlemek için tıklayın' : undefined}
                    >
                      <div className="flex justify-between items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-glow flex-shrink-0">
                            {(member.displayName || member.email || member.userId).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-indigo-100 text-sm sm:text-base truncate">
                              {member.displayName || member.email} {isCurrentUser && <span className="text-indigo-400">(Ben)</span>}
                            </h4>
                            <p className="text-xs sm:text-sm text-indigo-300/70 truncate">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold shadow-lg whitespace-nowrap ${
                            memberIsOwner
                              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                              : member.roleName === 'Member'
                              ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          }`}>
                            {member.roleName}
                          </span>
                          {isCurrentUser && <span className="text-indigo-400 text-xs font-semibold hidden sm:inline">✏️ Düzenle</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Takımdan Ayrıl Butonu */}
          <div className="flex justify-end mt-4 sm:mt-0">
            <button
              onClick={leaveConfirmModal.open}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 sm:py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-105 text-sm sm:text-base"
            >
              🚪 Takımdan Ayrıl
            </button>
          </div>
        </>
      )}

      {/* Takımdan Ayrıl Confirm Modal */}
      {leaveConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-glow-lg border border-indigo-500/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4 sm:mb-6">
              {isOwner ? '⚠️ Takım Sahibi Olarak Ayrılıyorsunuz!' : 'Takımdan Ayrıl'}
            </h3>
            {isOwner && (
              <div className="mb-4 p-3 sm:p-4 glass rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-orange-950/20">
                <p className="text-xs sm:text-sm text-yellow-300 mb-2 font-semibold">
                  <strong>⚠️ Uyarı:</strong> Takım sahibi olarak takımdan ayrılırsanız, takım ve tüm içerik silinecek!
                </p>
                <p className="text-xs sm:text-sm text-yellow-200/70 mb-3">Onaylamak için takım adını girin:</p>
                <input
                  type="text"
                  value={confirmTeamNameForm.formData.teamName}
                  onChange={(e) => confirmTeamNameForm.updateField('teamName', e.target.value)}
                  placeholder={selectedTeam?.name}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 glass border border-yellow-500/30 rounded-xl text-yellow-200 backdrop-blur-sm placeholder-yellow-300/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 transition-all text-sm sm:text-base"
                />
              </div>
            )}
            <p className="text-sm sm:text-base text-indigo-200 mb-4 sm:mb-6 font-semibold">
              {isOwner 
                ? 'Takımdan ayrılmak ve takımı silmek istediğinize emin misiniz?'
                : 'Takımdan ayrılmak istediğinize emin misiniz?'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleLeaveTeam}
                disabled={isOwner && confirmTeamNameForm.formData.teamName !== selectedTeam?.name}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-105 disabled:transform-none text-sm sm:text-base"
              >
                Evet, Ayrıl
              </button>
              <button
                onClick={() => {
                  leaveConfirmModal.close();
                  confirmTeamNameForm.reset();
                }}
                className="w-full sm:w-auto px-6 bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profil Düzenleme Modal */}
      <ProfileModal
        isOpen={profileEditModal.isOpen}
        onClose={profileEditModal.close}
      />
    </div>
  );
};

