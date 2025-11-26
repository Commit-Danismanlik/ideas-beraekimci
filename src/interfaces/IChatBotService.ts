import { IQueryResult } from '../types/base.types';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ISendMessageDto {
  message: string;
  conversationHistory?: IChatMessage[];
}

export interface IChatBotService {
  sendMessage(dto: ISendMessageDto): Promise<IQueryResult<string>>;
}

