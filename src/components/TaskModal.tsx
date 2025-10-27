import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ITask } from '../models/Task.model';
import { IMemberWithRole } from '../services/TeamMemberInfoService';

interface TaskModalProps {
  task: ITask;
  teamId: string;
  members: IMemberWithRole[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<ITask>) => void;
  onDelete: (taskId: string) => void;
}

export const TaskModal = ({
  task,
  teamId,
  members,
  onClose,
  onUpdate,
  onDelete,
}: TaskModalProps) => {
  const { user } = useAuthContext();
  const { hasPermission } = usePermissions(teamId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    assignedTo: task.assignedTo || '',
    status: task.status,
    priority: task.priority,
  });

  // Kullanıcı bu task'ı düzenleyebilir mi?
  const canEditTask = hasPermission('EDIT_TASK');
  const canDeleteTask = hasPermission('DELETE_TASK');
  const isAssignedToMe = task.assignedTo === user?.uid;

  // Atanan kişi her zaman status değiştirebilir
  const canChangeStatus = canEditTask || isAssignedToMe;

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Görev başlığı boş olamaz');
      return;
    }

    onUpdate(task.id, {
      title: formData.title,
      description: formData.description || undefined,
      assignedTo: formData.assignedTo || undefined,
      status: formData.status,
      priority: formData.priority,
    });
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleStatusChange = (newStatus: 'todo' | 'in-progress' | 'done') => {
    setFormData({ ...formData, status: newStatus });
    // Direkt kaydet
    onUpdate(task.id, { status: newStatus });
  };

  const assignedMember = members.find((m) => m.userId === task.assignedTo);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-scale">
      <div className="glass-strong rounded-2xl sm:rounded-3xl shadow-glow-lg border border-indigo-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="p-5 sm:p-6 glass-strong border-b border-indigo-500/20">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all font-bold text-lg sm:text-xl"
                  placeholder="Görev başlığı"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {task.title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-6">
          {/* Status */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-3">
              Durum
            </label>
            {canChangeStatus ? (
              <div className="flex gap-2 sm:gap-3">
                {(['todo', 'in-progress', 'done'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                      formData.status === status
                        ? status === 'done'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-glow'
                          : status === 'in-progress'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-glow'
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-glow'
                        : 'glass text-indigo-200 hover:text-indigo-100 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400 transition-all'
                    }`}
                  >
                    {status === 'done' ? '✅ Tamamlandı' : status === 'in-progress' ? '⏳ Devam Ediyor' : '📝 Yapılacak'}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm ${
                task.status === 'done'
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300'
                  : task.status === 'in-progress'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300'
                  : 'glass border border-indigo-500/30 text-indigo-200'
              }`}>
                {task.status === 'done' ? '✅ Tamamlandı' : task.status === 'in-progress' ? '⏳ Devam Ediyor' : '📝 Yapılacak'}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">
              Öncelik
            </label>
            {isEditing && canEditTask ? (
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
              >
                <option value="low">⚪ Düşük</option>
                <option value="medium">🟡 Orta</option>
                <option value="high">🔴 Yüksek</option>
              </select>
            ) : (
              <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg ${
                task.priority === 'high'
                  ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300'
                  : task.priority === 'medium'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-300'
                  : 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/30 text-slate-300'
              }`}>
                {task.priority === 'high' ? '🔴 Yüksek' : task.priority === 'medium' ? '🟡 Orta' : '⚪ Düşük'}
              </span>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">
              Atanan Kişi
            </label>
            {isEditing && canEditTask ? (
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
              >
                <option value="">Atanmadı</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 glass rounded-xl border border-indigo-500/30">
                {assignedMember ? (
                  <div>
                    <p className="font-bold text-indigo-100">
                      {assignedMember.displayName || assignedMember.email}
                    </p>
                    <p className="text-xs text-indigo-300/70 mt-1">{assignedMember.email}</p>
                  </div>
                ) : (
                  <p className="text-indigo-300/50 text-sm sm:text-base">Atanmadı</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">
              Açıklama
            </label>
            {isEditing && canEditTask ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
                rows={4}
                placeholder="Görev açıklaması..."
              />
            ) : (
              <div className="px-4 py-3 glass rounded-xl border border-indigo-500/30 min-h-[100px]">
                <p className="text-indigo-200/80 whitespace-pre-wrap text-sm sm:text-base">
                  {task.description || 'Açıklama yok'}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-indigo-500/20">
            <div>
              <p className="text-xs text-indigo-300/60 mb-1">Oluşturulma</p>
              <p className="text-xs sm:text-sm text-indigo-200">
                {new Date(task.createdAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-indigo-300/60 mb-1">Son Güncelleme</p>
              <p className="text-xs sm:text-sm text-indigo-200">
                {new Date(task.updatedAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {task.finishedAt && (
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs text-indigo-300/60 mb-1">Tamamlanma</p>
                <p className="text-xs sm:text-sm text-green-300">
                  {new Date(task.finishedAt).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 glass-strong border-t border-indigo-500/20 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex gap-2 sm:gap-3">
            {canDeleteTask && (
              <button
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 sm:py-2 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-105 text-sm sm:text-base"
              >
                🗑️ Sil
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-2 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
            >
              Kapat
            </button>
          </div>
          <div className="flex gap-2 sm:gap-3">
            {canEditTask && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2.5 sm:py-2 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 text-sm sm:text-base"
                  >
                    ✏️ Düzenle
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 sm:py-2 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 text-sm sm:text-base"
                    >
                      💾 Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          title: task.title,
                          description: task.description || '',
                          assignedTo: task.assignedTo || '',
                          status: task.status,
                          priority: task.priority,
                        });
                      }}
                      className="bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-2 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
                    >
                      İptal
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

