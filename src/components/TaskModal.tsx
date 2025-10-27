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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-white text-gray-800 font-bold text-xl"
                  placeholder="Görev başlığı"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Durum
            </label>
            {canChangeStatus ? (
              <div className="flex gap-2">
                {(['todo', 'in-progress', 'done'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      formData.status === status
                        ? status === 'done'
                          ? 'bg-green-500 text-white'
                          : status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'done' ? '✅ Tamamlandı' : status === 'in-progress' ? '⏳ Devam Ediyor' : '📝 Yapılacak'}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`py-2 px-4 rounded-lg ${
                task.status === 'done'
                  ? 'bg-green-100 text-green-800'
                  : task.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {task.status === 'done' ? '✅ Tamamlandı' : task.status === 'in-progress' ? '⏳ Devam Ediyor' : '📝 Yapılacak'}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Öncelik
            </label>
            {isEditing && canEditTask ? (
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            ) : (
              <span className={`inline-block px-3 py-1 rounded ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {task.priority === 'high' ? '🔴 Yüksek' : task.priority === 'medium' ? '🟡 Orta' : '⚪ Düşük'}
              </span>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Atanan Kişi
            </label>
            {isEditing && canEditTask ? (
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Atanmadı</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                {assignedMember ? (
                  <div>
                    <p className="font-semibold text-gray-800">
                      {assignedMember.displayName || assignedMember.email}
                    </p>
                    <p className="text-xs text-gray-500">{assignedMember.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Atanmadı</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Açıklama
            </label>
            {isEditing && canEditTask ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
                placeholder="Görev açıklaması..."
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg min-h-[100px]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.description || 'Açıklama yok'}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500">Oluşturulma</p>
              <p className="text-sm text-gray-700">
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
              <p className="text-xs text-gray-500">Son Güncelleme</p>
              <p className="text-sm text-gray-700">
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
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Tamamlanma</p>
                <p className="text-sm text-green-700">
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
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-between">
          <div className="flex gap-2">
            {canEditTask && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                  >
                    Düzenle
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      Kaydet
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
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      İptal
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2">
            {canDeleteTask && (
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Sil
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

