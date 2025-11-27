import { useState } from 'react';
import { IRole } from '../models/Role.model';

interface MemberItemProps {
  userId: string;
  email: string;
  displayName?: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
  roles: IRole[];
  onAssignRole: (userId: string, roleId: string) => void;
  onRemoveMember: (userId: string) => void;
}

export const MemberItem = ({
  userId,
  email,
  displayName,
  roleId,
  roleName,
  isOwner,
  roles,
  onAssignRole,
  onRemoveMember,
}: MemberItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roleId);

  const handleRoleChange = () => {
    if (selectedRole && selectedRole !== roleId) {
      onAssignRole(userId, selectedRole);
      setShowRoleChange(false);
      setShowMenu(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm(`${displayName || email} kullanıcısını takımdan çıkarmak istediğinize emin misiniz?`)) {
      onRemoveMember(userId);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => setShowMenu(!showMenu)}
        className="border border-indigo-800 rounded-lg p-3 hover:bg-indigo-700/30 cursor-pointer transition-colors"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h4 className="font-semibold text-indigo-200">
              {displayName || email}
            </h4>
            {displayName && email !== displayName && (
              <p className="text-xs text-indigo-400 truncate">{email}</p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className={`text-xs px-2 py-1 rounded font-semibold ${
              isOwner
                ? 'bg-yellow-500 text-white'
                : roleName === 'Member'
                ? 'bg-gray-200 text-gray-700'
                : 'bg-green-500 text-white'
            }`}>
              {roleName}
            </span>
            <span className="text-gray-400 text-xs">▼</span>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-sky-950 border border-indigo-900 rounded-lg shadow-lg z-10">
          {!showRoleChange ? (
            <>
              <button
                onClick={() => setShowRoleChange(true)}
                className="w-full text-left px-4 py-2 hover:bg-green-800/30 text-sm text-green-200"
              >
                🔄 Rolünü Değiştir
              </button>
              {!isOwner && (
                <button
                  onClick={handleRemove}
                  className="w-full text-left px-4 py-2 hover:bg-red-800/30 text-sm text-red-200 border-t"
                >
                  ❌ Takımdan Çıkar
                </button>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2 hover:bg-indigo-700/30 text-sm text-indigo-200 border-t"
              >
                İptal
              </button>
            </>
          ) : (
            <div className="p-3">
              <p className="text-xs font-semibold text-indigo-200 mb-2">Yeni Rol Seçin:</p>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full mb-2 px-3 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} {role.isDefault && '(Varsayılan)'}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleRoleChange}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-indigo-200 text-xs py-2 rounded"
                >
                  Değiştir
                </button>
                <button
                  onClick={() => {
                    setShowRoleChange(false);
                    setSelectedRole(roleId);
                  }}
                  className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-indigo-200 text-xs py-2 rounded"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

