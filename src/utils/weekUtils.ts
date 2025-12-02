/**
 * Week Utilities
 * SOLID: Single Responsibility - Sadece hafta hesaplamalarından sorumlu
 * Pure Functions - Yan etki yok
 */

export interface IWeekRange {
  start: Date;
  end: Date;
}

/**
 * Verilen tarihin hafta aralığını hesaplar (Pazartesi-Pazar)
 * @param date - Hesaplanacak tarih
 * @returns Hafta başlangıç ve bitiş tarihleri
 */
export const getWeekRange = (date: Date): IWeekRange => {
  const start = new Date(date);
  // Pazartesi günü hesapla (0 = Pazar, 1 = Pazartesi)
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazartesi'ye göre fark
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // 6 gün sonrası (Pazar)
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Hafta etiketi oluşturur
 * @param date - Hafta tarihi
 * @returns Hafta etiketi string'i
 */
export const getWeekLabel = (date: Date): string => {
  const { start, end } = getWeekRange(date);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
};

/**
 * Tarihin belirli bir hafta içinde olup olmadığını kontrol eder
 * @param date - Kontrol edilecek tarih
 * @param weekDate - Hafta tarihi
 * @returns Tarih hafta içindeyse true
 */
export const isDateInWeek = (date: Date, weekDate: Date): boolean => {
  const { start, end } = getWeekRange(weekDate);
  return date >= start && date <= end;
};

