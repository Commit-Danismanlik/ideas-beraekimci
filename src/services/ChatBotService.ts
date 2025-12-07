import { GoogleGenerativeAI } from '@google/generative-ai';
import { IChatBotService, IChatMessage, ISendMessageDto } from '../interfaces/IChatBotService';
import { IQueryResult } from '../types/base.types';
import { ITeamService } from '../interfaces/ITeamService';
import { DEFAULT_CHATBOT_RULES } from '../models/Team.model';

export class ChatBotService implements IChatBotService {
  private teamService: ITeamService;

  constructor(teamService: ITeamService) {
    this.teamService = teamService;
  }

  public async sendMessage(dto: ISendMessageDto): Promise<IQueryResult<string>> {
    if (!dto.message || dto.message.trim() === '') {
      return {
        success: false,
        error: 'Mesaj boş olamaz',
      };
    }

    if (!dto.teamId) {
      return {
        success: false,
        error: 'Takım ID gerekli',
      };
    }

    try {
      // Team'den API key ve kuralları al
      const teamResult = await this.teamService.getTeamById(dto.teamId);
      if (!teamResult.success || !teamResult.data) {
        return {
          success: false,
          error: 'Takım bulunamadı',
        };
      }

      const team = teamResult.data;
      const apiKey = team.geminiApiKey;

      if (!apiKey || apiKey.trim() === '') {
        return {
          success: false,
          error: 'API_KEY_NOT_CONFIGURED',
        };
      }

      // ChatBot kurallarını al
      let chatbotRules: string[] = DEFAULT_CHATBOT_RULES;
      if (team.chatbotRules) {
        chatbotRules = team.chatbotRules;
      }

      // System prompt olarak kuralları hazırla
      const systemInstruction = this.buildSystemInstruction(chatbotRules);

      // API key ile genAI instance'ı oluştur
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        systemInstruction: systemInstruction,
      });

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

  private buildSystemInstruction(rules: string[]): string {
    if (rules.length === 0) {
      return '';
    }

    // Kurallar zaten formatlanmış şekilde array'de saklanıyor, direkt birleştir
    const rulesText = rules.join('\n');
    return rulesText;
  }

  private formatHistory(history: IChatMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
    return history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  }
}

