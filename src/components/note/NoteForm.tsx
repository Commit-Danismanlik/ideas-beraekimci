interface INoteFormData {
  title: string;
  content: string;
  category: string;
}

interface NoteFormProps {
  showForm: boolean;
  formData: INoteFormData;
  onFormChange: (data: INoteFormData) => void;
  onShowForm: (show: boolean) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

/**
 * NoteForm Component
 * SOLID: Single Responsibility - Sadece not oluşturma formundan sorumlu
 */
export const NoteForm = ({
  showForm,
  formData,
  onFormChange,
  onShowForm,
  onSubmit,
  onCancel,
}: NoteFormProps): JSX.Element => {
  if (!showForm) {
    return (
      <div className="">
        <button
          onClick={() => onShowForm(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 text-sm sm:text-base"
        >
          + Yeni Not
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-500/20">
        <input
          type="text"
          placeholder="Not Başlığı"
          value={formData.title}
          onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
        />
        <textarea
          placeholder="Not İçeriği"
          value={formData.content}
          onChange={(e) => onFormChange({ ...formData, content: e.target.value })}
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
          rows={4}
        />
        <input
          type="text"
          placeholder="Kategori (opsiyonel)"
          value={formData.category}
          onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
          className="w-full mb-3 px-3 sm:px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
        />
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
