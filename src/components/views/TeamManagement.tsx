import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getTeamService, getRoleService, getTeamMemberInfoService } from '../../di/container';
import { ITeam } from '../../models/Team.model';
import { IRole, Permission, PERMISSION_DESCRIPTIONS } from '../../models/Role.model';
import { MemberItem } from '../common/MemberItem';
import { IMemberWithRole } from '../../services/TeamMemberInfoService';
import { MemoizedVirtualizedList } from '../common/VirtualizedList';
import { useModal } from '../../hooks/useModal';
import { useForm } from '../../hooks/useForm';
import { useClipboard } from '../../hooks/useClipboard';

interface TeamManagementProps {
  userTeams: ITeam[];
}

export const TeamManagement = ({ userTeams }: TeamManagementProps) => {
  const { user } = useAuthContext();
  const [selectedTeam, setSelectedTeam] = useState<string>(userTeams[0]?.id || '');
  const [roles, setRoles] = useState<IRole[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [membersWithInfo, setMembersWithInfo] = useState<IMemberWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const roleFormModal = useModal(false);
  const assignFormModal = useModal(false);
  const editTeamFormModal = useModal(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  interface IRoleFormData extends Record<string, unknown> {
    name: string;
    permissions: Permission[];
    color: string;
  }
  
  interface IAssignFormData extends Record<string, unknown> {
    userId: string;
    roleId: string;
  }
  
  interface ITeamEditFormData extends Record<string, unknown> {
    name: string;
    description: string;
  }
  
  const roleForm = useForm<IRoleFormData>({
    name: '',
    permissions: [],
    color: '#3B82F6', // Varsayılan mavi
  });
  const assignForm = useForm<IAssignFormData>({
    userId: '',
    roleId: '',
  });
  const teamEditForm = useForm<ITeamEditFormData>({
    name: '',
    description: '',
  });
  
  const { copy: copyToClipboard } = useClipboard();

  const teamService = getTeamService();
  const roleService = getRoleService();
  const memberInfoService = getTeamMemberInfoService();

  useEffect(() => {
    if (selectedTeam) {
      fetchData();
    }
  }, [selectedTeam]);

  const handleCopyTeamId = async (teamId: string) => {
    const success = await copyToClipboard(teamId);
    if (success) {
      alert('Takım ID kopyalandı!');
    } else {
      alert('Kopyalama başarısız oldu');
    }
  };

  const handleEditTeam = async () => {
    if (!selectedTeam) return;

    if (!teamEditForm.formData.name.trim()) {
      setError('Takım adı boş olamaz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await teamService.updateTeam(selectedTeam, {
        name: teamEditForm.formData.name,
        description: teamEditForm.formData.description,
      });

      if (result.success) {
        editTeamFormModal.close();
        teamEditForm.reset();
        fetchData();
      } else {
        setError(result.error || 'Takım güncellenemedi');
      }
    } catch (err) {
      setError('Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    setError(null);
    
    try {
      // Rolleri ve üye ID'lerini paralel çek
      const [rolesResult, membersArray] = await Promise.all([
        roleService.getTeamRoles(selectedTeam),
        teamService.getTeamMembers(selectedTeam),
      ]);

      if (rolesResult.success) {
        setRoles(rolesResult.data);
      } else {
        setError('Roller yüklenemedi: ' + rolesResult.error);
      }

      setMembers(membersArray);

      // Üye detaylarını (varsa) ayrı bir turda getir
      if (membersArray.length > 0) {
        const membersInfo = await memberInfoService.getMembersWithInfo(selectedTeam, membersArray);
        setMembersWithInfo(membersInfo);
      } else {
        setMembersWithInfo([]);
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
    }

    setLoading(false);
  };


  const handleEditRole = (role: IRole) => {
    if (role.isDefault) {
      alert('Varsayılan roller (Owner, Member) düzenlenemez');
      return;
    }
    
    setEditingRole(role);
    roleForm.setInitialData({
      name: role.name,
      permissions: role.permissions,
      color: role.color || '#3B82F6',
    });
    roleFormModal.open();
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!user || !selectedTeam || !window.confirm('Bu rolü silmek istediğinize emin misiniz?')) return;

    const result = await roleService.deleteRole(selectedTeam, roleId, user.uid);
    if (result.success) {
      // Optimistik kaldır
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      alert('Rol başarıyla silindi!');
    } else {
      alert('Hata: ' + result.error);
    }
  };

  const handleSaveRole = async () => {
    if (!user || !selectedTeam || !roleForm.formData.name.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setError(null);
    
    try {
      let result;
      
      if (editingRole) {
        // Düzenleme modu
        console.log('Rol düzenleniyor...', editingRole.id);
        result = await roleService.updateRole(
          selectedTeam,
          editingRole.id,
          {
            name: roleForm.formData.name,
            permissions: roleForm.formData.permissions,
            color: roleForm.formData.color,
          },
          user.uid
        );
      } else {
        // Yeni oluşturma modu
        console.log('Yeni rol oluşturuluyor...');
        result = await roleService.createRole(
          selectedTeam,
          {
            name: roleForm.formData.name,
            permissions: roleForm.formData.permissions,
            color: roleForm.formData.color,
          },
          user.uid
        );
      }

      console.log('Rol kaydetme sonucu:', result);

      if (result.success) {
        if (editingRole) {
          // Optimistik güncelle (index bazlı, kesin IRole[] döner)
          setRoles((prev) => {
            const idx = prev.findIndex((r) => r.id === editingRole.id);
            if (idx === -1) return prev;
            const updated: IRole = { ...prev[idx], name: roleForm.formData.name, permissions: roleForm.formData.permissions, color: roleForm.formData.color };
            return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
          });
        } else if (result.data) {
          // Optimistik ekleme: servis yeni ID döndürür
          const newRole: IRole = result.data;
          setRoles((prev) => [newRole, ...prev]);
        }
        roleForm.reset();
        roleFormModal.close();
        setEditingRole(null);
        alert(editingRole ? 'Rol başarıyla güncellendi!' : 'Rol başarıyla oluşturuldu!');
      } else {
        setError(result.error || 'Rol kaydedilemedi');
        console.error('Rol kaydetme hatası:', result.error);
      }
    } catch (err) {
      console.error('handleSaveRole exception:', err);
      setError(err instanceof Error ? err.message : 'Beklenmeyen hata');
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    if (!user || !selectedTeam) return;

    const result = await teamService.assignUserRole(selectedTeam, userId, roleId, user.uid);

    if (result.success) {
      // Optimistik güncelle: membersWithInfo içindeki roleId/roleName güncelle
      const role = roles.find((r) => r.id === roleId);
      setMembersWithInfo((prev) => prev.map((m) => (m.userId === userId ? { ...m, roleId, roleName: role?.name || m.roleName } : m)));
      alert('Rol başarıyla değiştirildi!');
    } else {
      alert('Hata: ' + result.error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!user || !selectedTeam) return;

    const result = await teamService.removeMember(selectedTeam, userId, user.uid);

    if (result.success) {
      // Optimistik olarak listeden çıkar
      setMembers((prev) => prev.filter((id) => id !== userId));
      setMembersWithInfo((prev) => prev.filter((m) => m.userId !== userId));
      alert('Kullanıcı takımdan çıkarıldı!');
    } else {
      alert('Hata: ' + result.error);
    }
  };

  const handleQuickAssignRole = async () => {
    if (!user || !selectedTeam || !assignForm.formData.userId || !assignForm.formData.roleId) {
      setError('Lütfen kullanıcı ve rol seçin');
      return;
    }

    setError(null);

    const result = await teamService.assignUserRole(
      selectedTeam,
      assignForm.formData.userId,
      assignForm.formData.roleId,
      user.uid
    );

    if (result.success) {
      assignForm.reset();
      assignFormModal.close();
      fetchData();
      alert('Rol başarıyla atandı!');
    } else {
      setError(result.error || 'Rol atanamadı');
    }
  };

  const togglePermission = (permission: Permission) => {
    if (roleForm.formData.permissions.includes(permission)) {
      roleForm.updateField('permissions', roleForm.formData.permissions.filter((p) => p !== permission));
    } else {
      roleForm.updateField('permissions', [...roleForm.formData.permissions, permission]);
    }
  };

  const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

  const allPermissions: Permission[] = [
    'CREATE_TASK',
    'EDIT_TASK',
    'DELETE_TASK',
    'ASSIGN_TASK',
    'CREATE_REPOSITORY',
    'EDIT_REPOSITORY',
    'DELETE_REPOSITORY',
    'MANAGE_ROLES',
    'MANAGE_MEMBERS',
    'INVITE_MEMBERS',
    'REMOVE_MEMBERS',
    'EDIT_TEAM',
    'DELETE_TEAM',
    'VIEW_TEAM_ID',
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Takım Yönetimi</h2>

        {userTeams.length > 1 && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
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
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-200">{selectedTeamData.name}</h3>
              <p className="text-sm text-indigo-300 mb-2">
                {selectedTeamData.description || 'Açıklama yok'}
              </p>
              <div className="flex gap-4 text-xs text-indigo-400">
                <span>👥 Üye Sayısı: {members.length}</span>
                <span>🎭 Rol Sayısı: {roles.length}</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              {/* Owner ise takım ID'sini göster */}
              {selectedTeamData.ownerId === user?.uid && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Takım ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-800 px-2 py-1 rounded border border-indigo-700 text-indigo-300">
                      {selectedTeamData.id}
                    </code>
                    <button
                      onClick={() => handleCopyTeamId(selectedTeamData.id)}
                      className="bg-cyan-900 shadow transition-all duration-300 hover:bg-cyan-800 text-indigo-200 p-1 rounded border border-indigo-800"
                      title="Takım ID'sini kopyala"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  teamEditForm.setInitialData({
                    name: selectedTeamData.name,
                    description: selectedTeamData.description || '',
                  });
                  editTeamFormModal.open();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1 px-3 rounded"
              >
                ✏️ Takımı Düzenle
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Takım Düzenleme Modal */}
      {editTeamFormModal.isOpen && selectedTeamData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-indigo-950 to-sky-950 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-indigo-100 mb-4">Takımı Düzenle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Takım Adı
                </label>
                <input
                  type="text"
                  value={teamEditForm.formData.name}
                  onChange={(e) => teamEditForm.updateField('name', e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-800 rounded-lg text-indigo-200 bg-indigo-950 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Takım adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={teamEditForm.formData.description}
                  onChange={(e) => teamEditForm.updateField('description', e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-800 rounded-lg text-indigo-200 bg-indigo-950 focus:ring-2 focus:ring-indigo-600 resize-none"
                  rows={3}
                  placeholder="Takım açıklamasını girin"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEditTeam}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg disabled:bg-gray-400"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    editTeamFormModal.close();
                    teamEditForm.reset();
                  }}
                  className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roller */}
        <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-indigo-100">Roller</h3>
            <button
              onClick={() => {
                setEditingRole(null);
                roleForm.reset();
                roleFormModal.toggle();
                setError(null);
              }}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1 px-3 rounded"
            >
              + Yeni Rol
            </button>
          </div>

          {roleFormModal.isOpen && (
            <div className="mb-4 p-3 bg-indigo-950/50 border border-indigo-900 rounded-lg">
              <h4 className="font-semibold text-indigo-100 mb-2">
                {editingRole ? `Rol Düzenle: ${editingRole.name}` : 'Yeni Custom Rol'}
              </h4>
              <input
                type="text"
                placeholder="Rol Adı (örn: Developer, Designer)"
                value={roleForm.formData.name}
                onChange={(e) => roleForm.updateField('name', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded text-sm"
              />
                
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-100 mb-1">
                  Rol Rengi
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={roleForm.formData.color}
                    onChange={(e) => roleForm.updateField('color', e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={roleForm.formData.color}
                    onChange={(e) => roleForm.updateField('color', e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2 font-semibold">Yetkiler:</p>
              <div className="max-h-60 overflow-y-auto mb-2 space-y-1">
                {allPermissions.map((permission) => (
                  <label key={permission} className="flex items-start gap-2 text-xs p-2 hover:bg-indigo-900/75 transition-all duration-300 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleForm.formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-medium">{permission}</span>
                      <p className="text-indigo-400">{PERMISSION_DESCRIPTIONS[permission]}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveRole}
                  disabled={!roleForm.formData.name.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded disabled:bg-gray-400"
                >
                  {editingRole ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  onClick={() => {
                    roleFormModal.close();
                    setEditingRole(null);
                    roleForm.reset();
                    setError(null);
                  }}
                  className="px-4 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 rounded"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : roles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz rol yok</p>
          ) : (
            <MemoizedVirtualizedList
              items={roles}
              itemKey={(r) => r.id}
              itemHeight={68}
              height={Math.min(480, Math.max(240, roles.length * 68))}
              renderItem={(role) => (
                <div
                  key={role.id}
                  className={`border rounded p-3 ${role.isDefault ? 'bg-green-100 border-green-500' : 'bg-blue-900/50 border border-blue-800'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${role.isDefault ? 'text-green-800' : 'text-blue-100'}`}>{role.name}</h4>
                        {role.isDefault && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Varsayılan</span>
                        )}
                        {role.isCustom && role.color && (
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: role.color }} title={`Renk: ${role.color}`} />
                        )}
                      </div>
                      <p className={`text-xs ${role.isDefault ? 'text-green-600' : 'text-blue-400'} mt-1`}>{role.permissions.length} yetki</p>
                    </div>
                    {role.isCustom && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditRole(role)} className="text-blue-600 hover:text-blue-700 text-xs">Düzenle</button>
                        <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-700 text-xs">Sil</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          )}
        </div>

        {/* Üye Rol Atama */}
        <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-indigo-100">Rol Atama</h3>
            <button
              onClick={assignFormModal.toggle}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1 px-3 rounded"
            >
              Rol Ata
            </button>
          </div>

          {assignFormModal.isOpen && (
            <div className="mb-4 p-3 bg-indigo-950/50 border border-indigo-900 rounded-lg">
              <h4 className="font-semibold text-gray-100 mb-2">Kullanıcıya Rol Ata</h4>
              
              <label className="block text-xs font-medium text-indigo-300 mb-1">
                Kullanıcı Seçin
              </label>
              <select
                value={assignForm.formData.userId}
                onChange={(e) => assignForm.updateField('userId', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded text-sm"
              >
                <option value="">Kullanıcı Seçin</option>
                {members.map((memberId) => (
                  <option key={memberId} value={memberId}>
                    {memberId}
                    {selectedTeamData?.ownerId === memberId && ' (Owner)'}
                  </option>
                ))}
              </select>

              <label className="block text-xs font-medium text-indigo-300 mb-1 mt-2">
                Rol Seçin
              </label>
              <select
                value={assignForm.formData.roleId}
                onChange={(e) => assignForm.updateField('roleId', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded text-sm"
              >
                <option value="">Rol Seçin</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                    {role.isDefault && ' (Varsayılan)'}
                    {!role.isDefault && ' (Custom)'}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleQuickAssignRole}
                  disabled={!assignForm.formData.userId || !assignForm.formData.roleId}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Ata
                </button>
                <button
                  onClick={() => {
                    assignFormModal.close();
                    assignForm.reset();
                    setError(null);
                  }}
                  className="px-4 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 rounded"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm mb-3">
              Takım Üyeleri ({membersWithInfo.length})
            </h4>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : membersWithInfo.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">Henüz üye yok</p>
            ) : (
              <MemoizedVirtualizedList
                items={membersWithInfo}
                itemKey={(m) => m.userId}
                itemHeight={86}
                height={Math.min(600, Math.max(280, membersWithInfo.length * 86))}
                renderItem={(member) => (
                  <MemberItem
                    key={member.userId}
                    userId={member.userId}
                    email={member.email}
                    displayName={member.displayName}
                    roleId={member.roleId}
                    roleName={member.roleName}
                    isOwner={selectedTeamData?.ownerId === member.userId}
                    roles={roles}
                    onAssignRole={handleAssignRole}
                    onRemoveMember={handleRemoveMember}
                  />
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

