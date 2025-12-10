import { IBaseEntity } from '../types/base.types';

// Team model - Ana team document
export interface ITeam extends IBaseEntity {
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  isActive: boolean;
  members: string[]; // User ID array
  taskIds: string[]; // Task ID array
  noteIds: string[]; // Note ID array
  todoIds: string[]; // Todo ID array
  chatbotRules?: string[]; // ChatBot kuralları - her takım için özelleştirilebilir
  geminiApiKey?: string; // Gemini API Key - her takım için ayrı API key
}

// Default ChatBot Rules
export const DEFAULT_CHATBOT_RULES: string[] = [
  'SYSTEM RULES (AI BEHAVIOR GUIDELINES)',
  '',
  '1) FORMAT',
  '   - Tüm cevaplar markdown formatında olmalıdır.',
  '   - Gereksiz açıklama veya selamlama ekleme, direkt konuya gir.',
  '',
  '2) KOD BLOKLARI',
  '   - Kod gerekiyorsa mutlaka üçlü backtick (```js, ```php vb.) ile kod bloğu olarak ver.',
  '   - Kodun hangi dile ait olduğunu mutlaka belirt (js, ts, html, css, php, sql, python gibi).',
  '   - Kod dışında ek açıklama gerekiyorsa kod bloğunun ALTINA yaz.',
  '',
  '3) TABLOLAR',
  '   - Tablo gerekiyorsa **markdown tablo** formatı kullan:',
  '     | Başlık | Başlık |',
  '     |--------|--------|',
  '     | Veri   | Veri   |',
  '   - Asla HTML tablo döndürme (talep edilmedikçe).',
  '   - Tablolar mesaj balonunun genişliğine uyum sağlar (yatay scroll ile).',
  '   - Çok geniş tablolar için özet tablo veya daha kompakt format kullan.',
  '',
  '4) LİSTELER',
  '   - Adım adım anlatımlar için madde işaretli veya numaralı liste kullan.',
  '   - Uzun açıklamalarda mutlaka başlıklar ve alt başlıklar kullan.',
  '',
  '5) DİYAGRAM / ÇİZİM',
  '   - Diyagram veya akış şeması gerekiyorsa ASCII tarzı basit çizim kullan:',
  '     ör:',
  '     A --> B',
  '          ↓',
  '          C',
  '',
  '6) JSON / STRUCTURED OUTPUT',
  '   - JSON istenirse mutlaka **tam geçerli JSON** döndür.',
  '   - JSON içinde açıklama veya yorum yazma (// şeklinde bile yazma).',
  '   - JSON dışına asla ek metin ekleme.',
  '',
  '7) BAŞLIKLAR',
  '   - İçerikler teknikse `## Başlık` ve `### Alt Başlık` formatı kullan.',
  '   - Uzun cevaplarda her konuyu bölüm bölüm ayır.',
  '',
  '8) KISA VE TEMİZ CEVAP',
  '   - Gereksiz tekrar veya giriş yapma.',
  '   - Mümkünse en temiz, düzenli, formatlı şekilde ver.',
  '',
  '9) SORU NET DEĞİLSE',
  '   - Kullanıcıyı sıkmadan kısa bir netleştirme iste.',
  '',
  '10) GÖRSEL FORMAT (UI uyumlu)',
  '   - Listeler, kodlar, tablolar ve başlıklar UI\'da düzgün görünmelidir.',
  '   - Gerektiğinde bloklar arasında boş satır kullanarak okunabilirlik artır.',
  '',
  '11) UZUN CEVAPLAR',
  '   - 40 satırı aşan kodları açıklama + tam kod olarak ikiye böl.',
  '   - Çok büyük tablo gerekiyorsa özet tablo + tam tablo şeklinde verilebilir.',
  '',
  '12) ÖNEMLİ KISIMLARI VURGULAMA',
  '   - Kritik bilgilerde **kalın** veya _italik_ stil kullan.',
  '',
  '13) ASLA YAPMA',
  '   - Kullanıcı istemedikçe HTML döndürme.',
  '   - Kod bloklarını kesme veya yarım bırakma.',
  '   - Çelişkili veya belirsiz açıklama yapma.',
];

// Create Team DTO
export interface ICreateTeamDto {
  name: string;
  description?: string;
}

// Update Team DTO
export interface IUpdateTeamDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  chatbotRules?: string[];
  geminiApiKey?: string;
}

// Assign Role DTO
export interface IAssignRoleDto {
  userId: string;
  roleId: string;
}

