import { useState } from 'react';
import { getWeekRange, getWeekLabel, isDateInWeek } from '../utils/weekUtils';

interface WeekPickerProps {
  selectedWeek: Date | null;
  onWeekSelect: (date: Date | null) => void;
  onClear: () => void;
}

/**
 * WeekPicker Component
 * SOLID: Single Responsibility - Sadece hafta seçiminden sorumlu
 */
export const WeekPicker = ({ selectedWeek, onWeekSelect, onClear }: WeekPickerProps): JSX.Element => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [calendarPreviewWeek, setCalendarPreviewWeek] = useState<Date>(new Date());

  const handleWeekSelect = (date: Date): void => {
    onWeekSelect(date);
    setShowCalendar(false);
  };

  const handlePreviousWeek = (): void => {
    const prev = new Date(calendarPreviewWeek);
    prev.setDate(prev.getDate() - 7);
    setCalendarPreviewWeek(prev);
  };

  const handleNextWeek = (): void => {
    const next = new Date(calendarPreviewWeek);
    next.setDate(next.getDate() + 7);
    setCalendarPreviewWeek(next);
  };

  const handleThisWeek = (): void => {
    const today = new Date();
    setCalendarPreviewWeek(today);
    handleWeekSelect(today);
  };

  const handleLastWeek = (): void => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    setCalendarPreviewWeek(lastWeek);
    handleWeekSelect(lastWeek);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1">Haftalık Tarih</label>
      <div className="relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-left text-gray-200 hover:bg-gray-800 flex items-center justify-between"
        >
          <span>{selectedWeek ? getWeekLabel(selectedWeek) : '📅 Hafta Seç'}</span>
          <span className="text-gray-400">▼</span>
        </button>

        {showCalendar && (
          <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 w-80">
            {/* Basit hafta seçici */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Pzt</div>
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Sal</div>
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Çar</div>
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Per</div>
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Cum</div>
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Cmt</div>
              <div className="text-xs font-semibold text-center text-gray-400 p-2">Paz</div>
              {Array.from({ length: 14 }, (_, i) => {
                const date = new Date(calendarPreviewWeek);
                date.setDate(calendarPreviewWeek.getDate() - 7 + i);
                const isSelected = isDateInWeek(date, calendarPreviewWeek);

                return (
                  <button
                    key={i}
                    onClick={() => handleWeekSelect(date)}
                    className={`text-xs p-2 rounded ${
                      isSelected
                        ? 'bg-indigo-700 text-white font-semibold'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Navigation butonları */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={handlePreviousWeek}
                className="flex-1 text-xs bg-gray-700 text-gray-200 py-2 rounded hover:bg-gray-600"
              >
                ← Önceki Hafta
              </button>
              <button
                onClick={handleNextWeek}
                className="flex-1 text-xs bg-gray-700 text-gray-200 py-2 rounded hover:bg-gray-600"
              >
                Sonraki Hafta →
              </button>
            </div>

            {/* Hızlı seçim butonları */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleThisWeek}
                className="flex-1 text-xs bg-indigo-700 text-white py-2 rounded hover:bg-indigo-800"
              >
                📅 Bu Hafta
              </button>
              <button
                onClick={handleLastWeek}
                className="flex-1 text-xs bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
              >
                ← Geçen Hafta
              </button>
            </div>

            {/* Seçili haftanın tarih aralığı */}
            <div className="text-xs text-center text-gray-300 font-semibold">
              {getWeekLabel(calendarPreviewWeek)}
            </div>
          </div>
        )}
      </div>
      {selectedWeek && (
        <button onClick={onClear} className="mt-1 text-xs text-red-600 hover:text-red-700">
          ✕ Temizle
        </button>
      )}
    </div>
  );
};

