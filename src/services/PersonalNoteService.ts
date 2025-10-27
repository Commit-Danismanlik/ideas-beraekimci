import { IPersonalNoteService } from '../interfaces/IPersonalRepositoryService';
import { PersonalNoteRepository } from '../repositories/PersonalNoteRepository';
import {
  IPersonalNote,
  ICreateNoteDto,
  IUpdateNoteDto,
} from '../models/PersonalRepository.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class PersonalNoteService implements IPersonalNoteService {
  private noteRepository: PersonalNoteRepository;

  constructor(noteRepository: PersonalNoteRepository) {
    this.noteRepository = noteRepository;
  }

  // Create Note
  public async createNote(
    userId: string,
    dto: ICreateNoteDto
  ): Promise<IQueryResult<IPersonalNote>> {
    if (!dto.title || dto.title.trim() === '') {
      return {
        success: false,
        error: 'Not başlığı boş olamaz',
      };
    }

    const noteData = {
      userId,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      tags: dto.tags || [],
      isPinned: dto.isPinned ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.noteRepository.create(noteData);
  }

  // Get Note By Id
  public async getNoteById(id: string): Promise<IQueryResult<IPersonalNote>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz not ID',
      };
    }
    return this.noteRepository.getById(id);
  }

  // Get User Notes
  public async getUserNotes(userId: string): Promise<IListQueryResult<IPersonalNote>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    return this.noteRepository.getNotesByUser(userId);
  }

  // Update Note
  public async updateNote(
    id: string,
    dto: IUpdateNoteDto
  ): Promise<IQueryResult<IPersonalNote>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz not ID',
      };
    }

    const exists = await this.noteRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        error: 'Not bulunamadı',
      };
    }

    return this.noteRepository.update(id, dto);
  }

  // Delete Note
  public async deleteNote(id: string): Promise<IQueryResult<boolean>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        data: false,
        error: 'Geçersiz not ID',
      };
    }

    const exists = await this.noteRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        data: false,
        error: 'Not bulunamadı',
      };
    }

    return this.noteRepository.delete(id);
  }

  // Get Pinned Notes
  public async getPinnedNotes(userId: string): Promise<IListQueryResult<IPersonalNote>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    return this.noteRepository.getPinnedNotes(userId);
  }

  // Toggle Pin
  public async togglePin(id: string): Promise<IQueryResult<IPersonalNote>> {
    const noteResult = await this.noteRepository.getById(id);
    if (!noteResult.success || !noteResult.data) {
      return {
        success: false,
        error: 'Not bulunamadı',
      };
    }

    return this.noteRepository.update(id, {
      isPinned: !noteResult.data.isPinned,
    });
  }

  // Get Notes By Category
  public async getNotesByCategory(
    userId: string,
    category: string
  ): Promise<IListQueryResult<IPersonalNote>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    return this.noteRepository.getNotesByCategory(userId, category);
  }
}

