import { IQueryResult, IListQueryResult } from '../types/base.types';
import {
  IChatConversation,
  ICreateChatConversationDto,
  IUpdateChatConversationDto,
} from '../models/ChatConversation.model';

export interface IChatConversationService {
  createConversation(
    teamId: string,
    userId: string,
    dto: ICreateChatConversationDto
  ): Promise<IQueryResult<IChatConversation>>;
  getConversationById(teamId: string, id: string): Promise<IQueryResult<IChatConversation>>;
  getAllConversations(teamId: string): Promise<IListQueryResult<IChatConversation>>;
  updateConversation(
    teamId: string,
    id: string,
    dto: IUpdateChatConversationDto
  ): Promise<IQueryResult<IChatConversation>>;
  deleteConversation(teamId: string, id: string): Promise<IQueryResult<boolean>>;
  getRecentConversations(teamId: string, limit: number): Promise<IListQueryResult<IChatConversation>>;
}
