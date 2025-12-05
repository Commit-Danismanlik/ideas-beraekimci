import { IBaseEntity } from '../types/base.types';
import { IChatMessage } from '../interfaces/IChatBotService';

// Chat Conversation model - Subcollection içinde
export interface IChatConversation extends IBaseEntity {
  title: string;
  messages: IChatMessage[];
  teamId: string;
}

// Create Chat Conversation DTO
export interface ICreateChatConversationDto {
  title: string;
  messages: IChatMessage[];
}

// Update Chat Conversation DTO
export interface IUpdateChatConversationDto {
  title?: string;
  messages?: IChatMessage[];
}
