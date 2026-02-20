interface IMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface ITodoFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
}

interface TodoFormProps {
  showForm: boolean;
  formData: ITodoFormData;
  members: IMember[];
  onFormChange: (data: ITodoFormData) => void;
  onShowForm: (show: boolean) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export const TodoForm = ({
  showForm,
  formData,
  members,
  onFormChange,
  onShowForm,
  onSubmit,
  onCancel,
}: TodoFormProps): JSX.Element => {
  if (!showForm) {
    return (
      <div className="">
        <button
          onClick={() => onShowForm(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 text-sm sm:text-base"
        >
          + Yeni To-Do
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-500/20">
        <input
          type="text"
          placeholder="To-Do Başlığı"
          value={formData.title}
          onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
        />
        <textarea
          placeholder="Açıklama (opsiyonel) - Markdown desteği: **kalın**, _italik_"
          value={formData.description}
          onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
          rows={2}
        />
        <select
          value={formData.assignedTo}
          onChange={(e) => onFormChange({ ...formData, assignedTo: e.target.value })}
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
        >
          <option value="">Atama yapılmadı (Opsiyonel)</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.displayName || member.email || member.userId}
              {member.displayName && member.email ? ` (${member.email})` : ''}
            </option>
          ))}
        </select>
        <select
          value={formData.priority}
          onChange={(e) =>
            onFormChange({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
          }
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
        >
          <option value="low">Düşük Öncelik</option>
          <option value="medium">Orta Öncelik</option>
          <option value="high">Yüksek Öncelik</option>
        </select>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onSubmit}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 text-sm sm:text-base"
          >
            Kaydet
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};
