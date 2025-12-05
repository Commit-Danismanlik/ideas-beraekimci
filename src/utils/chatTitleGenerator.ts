/**
 * İlk prompttan uygun bir başlık oluşturur
 * ChatGPT ve Gemini tarzında kısa ve öz başlıklar üretir
 */
export const generateChatTitle = (firstPrompt: string): string => {
  if (!firstPrompt || firstPrompt.trim() === '') {
    return 'Yeni Sohbet';
  }

  // Başlık için maksimum karakter sayısı
  const MAX_TITLE_LENGTH = 50;

  // Trim yap ve fazla boşlukları temizle
  let title = firstPrompt.trim().replace(/\s+/g, ' ');

  // Eğer çok uzunsa kısalt
  if (title.length > MAX_TITLE_LENGTH) {
    // Kelime sınırında kes
    const truncated = title.substring(0, MAX_TITLE_LENGTH);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      title = truncated.substring(0, lastSpaceIndex) + '...';
    } else {
      title = truncated + '...';
    }
  }

  // İlk harfi büyük yap
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title;
};
