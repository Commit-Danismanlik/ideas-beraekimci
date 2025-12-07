interface ITodoEditForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface TodoEditModalProps {
  isOpen: boolean;
  formData: ITodoEditForm;
  onFormChange: (data: ITodoEditForm) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}

/**
 * TodoEditModal Component
 * SOLID: Single Responsibility - Sadece todo düzenleme modal'ından sorumlu
 */
export const TodoEditModal = ({
  isOpen,
  formData,
  onFormChange,
  onClose,
  onSave,
}: TodoEditModalProps): JSX.Element | null => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
      <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-glow-lg border border-indigo-500/20 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            To-Do'yu Düzenle
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
              placeholder="Başlık"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
              rows={4}
              placeholder="Açıklama - Markdown desteği: **kalın**, _italik_"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Öncelik</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                onFormChange({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
            >
              <option value="low">⚪ Düşük Öncelik</option>
              <option value="medium">🟡 Orta Öncelik</option>
              <option value="high">🔴 Yüksek Öncelik</option>
            </select>
          </div>
          <label className="flex items-center gap-2 p-3 sm:p-4 glass rounded-xl border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/10 transition-all">
            <input
              type="checkbox"
              checked={formData.completed}
              onChange={(e) => onFormChange({ ...formData, completed: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-green-600 checked:to-emerald-600 checked:border-transparent transition-all cursor-pointer"
            />
            <span className="text-sm sm:text-base text-indigo-200 font-semibold">✅ Tamamlandı</span>
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 text-sm sm:text-base"
          >
            Kaydet
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

