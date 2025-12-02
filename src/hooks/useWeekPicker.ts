import { useState, useCallback } from 'react';

export interface UseWeekPickerReturn {
  selectedWeek: Date | null;
  showCalendar: boolean;
  calendarPreviewWeek: Date;
  setSelectedWeek: (date: Date | null) => void;
  handleWeekSelect: (date: Date) => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handleThisWeek: () => void;
  handleLastWeek: () => void;
  toggleCalendar: () => void;
  clearWeek: () => void;
}

/**
 * useWeekPicker Hook
 * Hafta seçici state yönetimi için
 * SOLID: Single Responsibility - Sadece hafta seçici state yönetiminden sorumlu
 */
export const useWeekPicker = (initialWeek: Date | null = null): UseWeekPickerReturn => {
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(initialWeek);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [calendarPreviewWeek, setCalendarPreviewWeek] = useState<Date>(new Date());

  const handleWeekSelect = useCallback((date: Date): void => {
    setSelectedWeek(date);
    setShowCalendar(false);
  }, []);

  const handlePreviousWeek = useCallback((): void => {
    const prev = new Date(calendarPreviewWeek);
    prev.setDate(prev.getDate() - 7);
    setCalendarPreviewWeek(prev);
  }, [calendarPreviewWeek]);

  const handleNextWeek = useCallback((): void => {
    const next = new Date(calendarPreviewWeek);
    next.setDate(next.getDate() + 7);
    setCalendarPreviewWeek(next);
  }, [calendarPreviewWeek]);

  const handleThisWeek = useCallback((): void => {
    const today = new Date();
    setCalendarPreviewWeek(today);
    handleWeekSelect(today);
  }, [handleWeekSelect]);

  const handleLastWeek = useCallback((): void => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    setCalendarPreviewWeek(lastWeek);
    handleWeekSelect(lastWeek);
  }, [handleWeekSelect]);

  const toggleCalendar = useCallback((): void => {
    setShowCalendar((prev) => !prev);
  }, []);

  const clearWeek = useCallback((): void => {
    setSelectedWeek(null);
  }, []);

  return {
    selectedWeek,
    showCalendar,
    calendarPreviewWeek,
    setSelectedWeek,
    handleWeekSelect,
    handlePreviousWeek,
    handleNextWeek,
    handleThisWeek,
    handleLastWeek,
    toggleCalendar,
    clearWeek,
  };
};

