import { IChatConversationService } from '../interfaces/IChatConversationService';
import { IRoleService } from '../interfaces/IRoleService';
import { ChatConversationRepository } from '../repositories/ChatConversationRepository';
import {
  IChatConversation,
  ICreateChatConversationDto,
  IUpdateChatConversationDto,
} from '../models/ChatConversation.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class ChatConversationService implements IChatConversationService {
  private conversationRepository: ChatConversationRepository;
  private roleService: IRoleService;

  constructor(
    conversationRepository: ChatConversationRepository,
    roleService: IRoleService
  ) {
    this.conversationRepository = conversationRepository;
    this.roleService = roleService;
  }

  // Create Conversation
  public async createConversation(
    teamId: string,
    userId: string,
    dto: ICreateChatConversationDto
  ): Promise<IQueryResult<IChatConversation>> {
    // Validation kontrolleri
    if (!dto.title || dto.title.trim() === '') {
      return {
        success: false,
        error: 'Konuşma başlığı boş olamaz',
      };
    }

    if (!dto.messages || dto.messages.length === 0) {
      return {
        success: false,
        error: 'Konuşma en az bir mesaj içermelidir',
      };
    }

    const conversationData: Partial<IChatConversation> = {
      title: dto.title,
      messages: dto.messages,
      teamId: teamId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.conversationRepository.create(teamId, conversationData);
    return result;
  }

  // Get Conversation By Id
  public async getConversationById(
    teamId: string,
    id: string
  ): Promise<IQueryResult<IChatConversation>> {
    return this.conversationRepository.getById(teamId, id);
  }

  // Get All Conversations
  public async getAllConversations(
    teamId: string
  ): Promise<IListQueryResult<IChatConversation>> {
    return this.conversationRepository.getAllOrderedByDate(teamId);
  }

  // Update Conversation
  public async updateConversation(
    teamId: string,
    id: string,
    dto: IUpdateChatConversationDto
  ): Promise<IQueryResult<IChatConversation>> {
    const updateData: Partial<IChatConversation> = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }
    if (dto.messages !== undefined) {
      updateData.messages = dto.messages;
    }

    return this.conversationRepository.update(teamId, id, updateData);
  }

  // Delete Conversation
  public async deleteConversation(
    teamId: string,
    id: string
  ): Promise<IQueryResult<boolean>> {
    return this.conversationRepository.delete(teamId, id);
  }

  // Get Recent Conversations
  public async getRecentConversations(
    teamId: string,
    limit: number
  ): Promise<IListQueryResult<IChatConversation>> {
    return this.conversationRepository.getRecent(teamId, limit);
  }
}
