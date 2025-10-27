import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getTeamService, getTeamMemberInfoService } from '../di/container';
import { ITeam } from '../models/Team.model';
import { IMemberWithRole } from '../services/TeamMemberInfoService';

export const MyTeam = ({ onTeamChange }: { onTeamChange: () => void }) => {
  const { user } = useAuthContext();
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [members, setMembers] = useState<IMemberWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [confirmTeamName, setConfirmTeamName] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });

  const openProfileEdit = () => {
    const currentUser = getCurrentUserInfo();
    if (currentUser && user) {
      setProfileForm({
        name: currentUser.displayName || '',
        email: currentUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowProfileEdit(true);
    }
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
    if (!selectedTeam) return;

    setLoading(true);
    try {
      const membersData = await memberInfoService.getMembersWithInfo(teamId, selectedTeam.members);
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
      if (confirmTeamName !== selectedTeam.name) {
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
      setShowLeaveConfirm(false);
      setConfirmTeamName('');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Yeni şifre girilmişse validasyonlar
    if (profileForm.newPassword || profileForm.confirmPassword) {
      if (!profileForm.currentPassword) {
        alert('Mevcut şifrenizi girin');
        return;
      }

      if (profileForm.newPassword !== profileForm.confirmPassword) {
        alert('Yeni şifreler eşleşmiyor');
        return;
      }

      if (profileForm.newPassword.length < 6) {
        alert('Yeni şifre en az 6 karakter olmalıdır');
        return;
      }
    }

    setLoading(true);
    try {
      // TODO: Update user profile with password verification
      console.log('Profile update with password verification');
      
      // Şimdilik sadece isim güncellenecek
      if (profileForm.name) {
        console.log('Updating name:', profileForm.name);
        // TODO: Implement name update in Firestore
      }

      setShowProfileEdit(false);
      alert('Profil güncellendi (Henüz implement edilmedi)');
    } catch (err) {
      alert('Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserInfo = () => {
    return members.find(m => m.userId === user?.uid);
  };

  if (loading && teams.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Henüz Bir Takımınız Yok</h2>
        <p className="text-gray-600 mb-4">Bir takıma katılmak veya yeni takım oluşturmak için dashboard'a dönün</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  const currentUserInfo = getCurrentUserInfo();
  const isOwner = selectedTeam?.ownerId === user?.uid;

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Takım Seçici */}
      {teams.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Takım Seç
          </label>
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const team = teams.find(t => t.id === e.target.value);
              if (team) setSelectedTeam(team);
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg"
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
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.name}</h2>
                <p className="text-gray-600 mt-2">{selectedTeam.description || 'Açıklama yok'}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                  <span>👥 Üye Sayısı: {members.length}</span>
                  <span>📅 Oluşturulma: {new Date(selectedTeam.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Takım ID</p>
                <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                  {selectedTeam.id}
                </code>
              </div>
            </div>
          </div>

          {/* Üyeler */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Takım Üyeleri</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : members.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz üye yok</p>
            ) : (
              <div className="grid gap-4">
                {members.map((member) => {
                  const isCurrentUser = member.userId === user?.uid;
                  const memberIsOwner = selectedTeam.ownerId === member.userId;

                  return (
                    <div
                      key={member.userId}
                      onClick={isCurrentUser ? openProfileEdit : undefined}
                      className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                        isCurrentUser
                          ? 'border-indigo-500 hover:border-indigo-600 hover:shadow-md'
                          : 'border-gray-200'
                      }`}
                      title={isCurrentUser ? 'Bilgileri düzenlemek için tıklayın' : undefined}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                            {(member.displayName || member.email || member.userId).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {member.displayName || member.email} {isCurrentUser && '(Ben)'}
                            </h4>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            memberIsOwner
                              ? 'bg-yellow-500 text-white'
                              : member.roleName === 'Member'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-green-500 text-white'
                          }`}>
                            {member.roleName}
                          </span>
                          {isCurrentUser && <span className="text-indigo-600 text-xs">✏️ Düzenle</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Takımdan Ayrıl Butonu */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
            >
              🚪 Takımdan Ayrıl
            </button>
          </div>
        </>
      )}

      {/* Takımdan Ayrıl Confirm Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isOwner ? '⚠️ Takım Sahibi Olarak Ayrılıyorsunuz!' : 'Takımdan Ayrıl'}
            </h3>
            {isOwner && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Uyarı:</strong> Takım sahibi olarak takımdan ayrılırsanız, takım ve tüm içerik silinecek!
                </p>
                <p className="text-sm text-gray-700 mb-2">Onaylamak için takım adını girin:</p>
                <input
                  type="text"
                  value={confirmTeamName}
                  onChange={(e) => setConfirmTeamName(e.target.value)}
                  placeholder={selectedTeam?.name}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}
            <p className="text-gray-600 mb-4">
              {isOwner 
                ? 'Takımdan ayrılmak ve takımı silmek istediğinize emin misiniz?'
                : 'Takımdan ayrılmak istediğinize emin misiniz?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleLeaveTeam}
                disabled={isOwner && confirmTeamName !== selectedTeam?.name}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Evet, Ayrıl
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setConfirmTeamName('');
                }}
                className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profil Düzenleme Modal */}
      {showProfileEdit && currentUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Profil Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  defaultValue={currentUserInfo.displayName}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email değiştirmek için yöneticinize başvurunuz.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                <input
                  type="text"
                  value={currentUserInfo.birthDate ? new Date(currentUserInfo.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Doğum tarihi değiştirilemez</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Şifre değiştirmek için mevcut şifrenizi girin"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Şifre değiştirmek istemiyorsanız boş bırakın
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateProfile}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
              >
                Kaydet
              </button>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

