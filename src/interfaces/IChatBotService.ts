import { IQueryResult } from '../types/base.types';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId?: string; // Kullanıcı mesajları için userId
}

export interface ISendMessageDto {
  message: string;
  teamId?: string;
  conversationHistory?: IChatMessage[];
}

export interface IChatBotService {
  sendMessage(dto: ISendMessageDto): Promise<IQueryResult<string>>;
}

