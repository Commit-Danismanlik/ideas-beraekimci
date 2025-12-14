interface ITaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

interface TaskFormProps {
  showForm: boolean;
  formData: ITaskFormData;
  members: Array<{ userId: string; displayName?: string; email?: string }>;
  onFormChange: (data: ITaskFormData) => void;
  onShowForm: (show: boolean) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  columnCount: number;
  onColumnCountChange: (value: number) => void;
}

/**
 * TaskForm Component
 * SOLID: Single Responsibility - Sadece görev oluşturma formundan sorumlu
 */
export const TaskForm = ({
  showForm,
  formData,
  members,
  onFormChange,
  onShowForm,
  onSubmit,
  onCancel,
  itemsPerPage,
  onItemsPerPageChange,
  columnCount,
  onColumnCountChange,
}: TaskFormProps): JSX.Element => {
  if (!showForm) {
    return (
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            + Yeni Görev
          </button>
          <button
            onClick={() => onColumnCountChange(1)}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
              columnCount === 1
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            I
          </button>
          <button
            onClick={() => onColumnCountChange(2)}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
              columnCount === 2
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            II
          </button>
          <button
            onClick={() => onColumnCountChange(3)}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
              columnCount === 3
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            III
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Sayfa Başına:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={itemsPerPage}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 50) {
                onItemsPerPageChange(value);
              }
            }}
            className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm text-center"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-100 mb-3">Yeni Görev Oluştur</h3>
        <input
          type="text"
          placeholder="Görev Başlığı *"
          value={formData.title}
          onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
          className="w-full mb-2 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500"
        />
        <textarea
          placeholder="Açıklama (opsiyonel) - Markdown desteği: **kalın**, _italik_"
          value={formData.description}
          onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          className="w-full mb-2 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500"
          rows={3}
        />
        <label className="block text-sm font-medium text-gray-300 mb-1">Atanacak Kişi</label>
        <select
          value={formData.assignedTo}
          onChange={(e) => onFormChange({ ...formData, assignedTo: e.target.value })}
          className="w-full mb-2 px-4 py-2 border border-indigo-500/30 rounded-lg bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
        >
          <option value="">Atanmadı</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.displayName || member.email}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={formData.status}
            onChange={(e) =>
              onFormChange({
                ...formData,
                status: e.target.value as 'todo' | 'in-progress' | 'done',
              })
            }
            className="px-4 py-2 border border-indigo-500/30 rounded-lg bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
          >
            <option value="todo">Yapılacak</option>
            <option value="in-progress">Devam Ediyor</option>
            <option value="done">Tamamlandı</option>
          </select>
          <select
            value={formData.priority}
            onChange={(e) =>
              onFormChange({
                ...formData,
                priority: e.target.value as 'low' | 'medium' | 'high',
              })
            }
            className="px-4 py-2 border border-indigo-500/30 rounded-lg bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
          >
            <option value="low">Düşük Öncelik</option>
            <option value="medium">Orta Öncelik</option>
            <option value="high">Yüksek Öncelik</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSubmit}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Kaydet
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

