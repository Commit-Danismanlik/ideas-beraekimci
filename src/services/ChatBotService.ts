import { GoogleGenerativeAI } from '@google/generative-ai';
import { IChatBotService, IChatMessage, ISendMessageDto } from '../interfaces/IChatBotService';
import { IQueryResult } from '../types/base.types';

export class ChatBotService implements IChatBotService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly apiKey: string;

  constructor() {
    // Environment değişkenini oku - hem string hem de undefined kontrolü yap
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKeyString = typeof apiKey === 'string' ? apiKey.trim() : '';
    
    if (!apiKeyString) {
      console.error('GEMINI_API_KEY bulunamadı. .env dosyasında VITE_GEMINI_API_KEY tanımlı olmalı.');
      console.error('Mevcut değer:', import.meta.env.VITE_GEMINI_API_KEY);
      this.apiKey = '';
    } else {
      this.apiKey = apiKeyString;
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  public async sendMessage(dto: ISendMessageDto): Promise<IQueryResult<string>> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasında VITE_GEMINI_API_KEY tanımlayın.',
      };
    }

    if (!dto.message || dto.message.trim() === '') {
      return {
        success: false,
        error: 'Mesaj boş olamaz',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      // Konuşma geçmişini formatla
      const history = this.formatHistory(dto.conversationHistory || []);
      
      // Yeni mesajı ekle
      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(dto.message);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        data: text,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      return {
        success: false,
        error: `Gemini API hatası: ${errorMessage}`,
      };
    }
  }

  private formatHistory(history: IChatMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
    return history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  }
}

