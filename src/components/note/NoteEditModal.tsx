import { useState, useEffect, useCallback, useRef } from 'react';

interface INoteEditForm {
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
}

interface NoteEditModalProps {
  isOpen: boolean;
  formData: INoteEditForm;
  onFormChange: (data: INoteEditForm) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}

const INPUT_CLASS =
  'w-full px-4 py-3 glass border border-indigo-500/30 rounded-xl text-indigo-100 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-400/60 text-sm sm:text-base';

/**
 * NoteEditModal Component
 * SOLID: Single Responsibility - Sadece not düzenleme modal'ından sorumlu
 */
export const NoteEditModal = ({
  isOpen,
  formData,
  onFormChange,
  onClose,
  onSave,
}: NoteEditModalProps): JSX.Element | null => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!formData.title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }, [formData.title, isSaving, onSave]);

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      titleInputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-edit-title"
    >
      <div
        className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-glow-lg border border-indigo-500/20 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2
            id="note-edit-title"
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
          >
            ✏️ Notu Düzenle
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20 rounded-xl transition-all duration-200 hover:scale-105"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sol: Başlık, Kategori, Sabitle */}
          <div className="lg:w-[280px] shrink-0 space-y-5">
            <div>
              <label htmlFor="edit-note-title" className="block text-sm font-semibold text-indigo-200 mb-1.5">
                Başlık <span className="text-rose-400">*</span>
              </label>
              <input
                ref={titleInputRef}
                id="edit-note-title"
                type="text"
                value={formData.title}
                onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
                className={INPUT_CLASS}
                placeholder="Notunuzun başlığını girin"
                maxLength={100}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-indigo-400/70">{formData.title.length}/100</p>
            </div>

            <div>
              <label htmlFor="edit-note-category" className="block text-sm font-semibold text-indigo-200 mb-1.5">
                Kategori <span className="text-indigo-400/60 font-normal">(opsiyonel)</span>
              </label>
              <input
                id="edit-note-category"
                type="text"
                value={formData.category}
                onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
                className={INPUT_CLASS}
                placeholder="örn: İş, Kişisel, Fikirler..."
                autoComplete="off"
              />
            </div>

            <label className="flex items-start gap-3 p-4 glass rounded-xl border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/10 transition-all group">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => onFormChange({ ...formData, isPinned: e.target.checked })}
                className="mt-0.5 w-5 h-5 rounded border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-purple-600 checked:border-transparent transition-all cursor-pointer shrink-0"
              />
              <span className="text-sm text-indigo-200 group-hover:text-indigo-100">
                <span className="font-semibold block">📌 Notu Sabitle</span>
                <span className="text-indigo-400/70 text-xs mt-0.5 block">
                  Sabitlenen notlar listenin en üstünde görünür (en fazla 3 not)
                </span>
              </span>
            </label>
          </div>

          {/* Sağ: İçerik (ana alan) */}
          <div className="flex-1 min-w-0">
            <label htmlFor="edit-note-content" className="block text-sm font-semibold text-indigo-200 mb-1.5">
              İçerik <span className="text-indigo-400/60 font-normal">— Notun ana metni</span>
            </label>
            <textarea
              id="edit-note-content"
              value={formData.content}
              onChange={(e) => onFormChange({ ...formData, content: e.target.value })}
              className={`${INPUT_CLASS} min-h-[200px] sm:min-h-[300px] lg:min-h-[500px] resize-y w-full`}
              placeholder="Notunuzun detaylarını yazın..."
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-4 border-t border-indigo-500/20">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 bg-slate-700/30 hover:bg-slate-600/30 text-indigo-200 font-semibold rounded-xl transition-all duration-200 border border-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title.trim() || isSaving}
            className="flex-1 sm:flex-none sm:min-w-[140px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Kaydediliyor...
              </>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
