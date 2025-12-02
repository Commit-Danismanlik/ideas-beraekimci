import { ITeamNoteService } from '../interfaces/ITeamRepositoryService';
import { IRoleService } from '../interfaces/IRoleService';
import { TeamNoteRepository } from '../repositories/TeamNoteRepository';
import { TeamRepository } from '../repositories/TeamRepository';
import {
  ITeamNote,
  ICreateTeamNoteDto,
  IUpdateTeamNoteDto,
} from '../models/TeamRepository.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class TeamNoteService implements ITeamNoteService {
  private noteRepository: TeamNoteRepository;
  private teamRepository: TeamRepository;
  private roleService: IRoleService;

  constructor(
    noteRepository: TeamNoteRepository,
    teamRepository: TeamRepository,
    roleService: IRoleService
  ) {
    this.noteRepository = noteRepository;
    this.teamRepository = teamRepository;
    this.roleService = roleService;
  }

  // Create Note
  public async createNote(
    teamId: string,
    userId: string,
    dto: ICreateTeamNoteDto
  ): Promise<IQueryResult<ITeamNote>> {
    // Permission kontrolü
    const hasPermission = await this.roleService.hasPermission(
      userId,
      teamId,
      'CREATE_REPOSITORY'
    );
    if (!hasPermission) {
      return {
        success: false,
        error: 'Bu işlem için yetkiniz yok',
      };
    }

    if (!dto.title || dto.title.trim() === '') {
      return {
        success: false,
        error: 'Not başlığı boş olamaz',
      };
    }

    const noteData = {
      createdBy: userId,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      tags: dto.tags || [],
      isPinned: dto.isPinned ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Not'u subcollection'a ekle
    const noteResult = await this.noteRepository.create(teamId, noteData);
    
    if (noteResult.success && noteResult.data) {
      // Team document'teki noteIds array'ine ekle
      const teamResult = await this.teamRepository.getById(teamId);
      if (teamResult.success && teamResult.data) {
        const updatedNoteIds = [...teamResult.data.noteIds, noteResult.data.id];
        await this.teamRepository.update(teamId, { noteIds: updatedNoteIds });
      }
    }

    return noteResult;
  }

  // Get Note By Id
  public async getNoteById(teamId: string, id: string): Promise<IQueryResult<ITeamNote>> {
    return this.noteRepository.getById(teamId, id);
  }

  // Get Team Notes
  public async getTeamNotes(teamId: string): Promise<IListQueryResult<ITeamNote>> {
    return this.noteRepository.getAll(teamId);
  }

  // Performans: yakın tarihli notları getir (limitli)
  public async getRecentNotes(teamId: string, take: number): Promise<IListQueryResult<ITeamNote>> {
    if (!teamId || teamId.trim() === '' || take <= 0) {
      return { success: false, data: [], error: 'Geçersiz parametre', total: 0 };
    }
    return this.noteRepository.getRecent(teamId, take);
  }

  // Performans: belirli tarihten önceki notları getir (limitli)
  public async getRecentNotesBefore(teamId: string, before: Date, take: number): Promise<IListQueryResult<ITeamNote>> {
    if (!teamId || teamId.trim() === '' || take <= 0) {
      return { success: false, data: [], error: 'Geçersiz parametre', total: 0 };
    }
    return this.noteRepository.getRecentBefore(teamId, before, take);
  }

  // Update Note
  public async updateNote(
    teamId: string,
    id: string,
    userId: string,
    dto: IUpdateTeamNoteDto
  ): Promise<IQueryResult<ITeamNote>> {
    // Permission kontrolü
    const hasPermission = await this.roleService.hasPermission(
      userId,
      teamId,
      'EDIT_REPOSITORY'
    );
    if (!hasPermission) {
      return {
        success: false,
        error: 'Bu işlem için yetkiniz yok',
      };
    }

    return this.noteRepository.update(teamId, id, dto);
  }

  // Delete Note
  public async deleteNote(teamId: string, id: string, userId: string): Promise<IQueryResult<boolean>> {
    // Permission kontrolü
    const hasPermission = await this.roleService.hasPermission(
      userId,
      teamId,
      'DELETE_REPOSITORY'
    );
    if (!hasPermission) {
      return {
        success: false,
        data: false,
        error: 'Bu işlem için yetkiniz yok',
      };
    }

    const deleteResult = await this.noteRepository.delete(teamId, id);
    
    if (deleteResult.success) {
      // Team document'teki noteIds array'inden çıkar
      const teamResult = await this.teamRepository.getById(teamId);
      if (teamResult.success && teamResult.data) {
        const updatedNoteIds = teamResult.data.noteIds.filter((noteId) => noteId !== id);
        await this.teamRepository.update(teamId, { noteIds: updatedNoteIds });
      }
    }

    return deleteResult;
  }

  // Toggle Pin
  public async togglePin(teamId: string, id: string, userId: string): Promise<IQueryResult<ITeamNote>> {
    const noteResult = await this.noteRepository.getById(teamId, id);
    if (!noteResult.success || !noteResult.data) {
      return {
        success: false,
        error: 'Not bulunamadı',
      };
    }

    const note = noteResult.data;

    // Permission kontrolü
    const hasPermission = await this.roleService.hasPermission(
      userId,
      teamId,
      'EDIT_REPOSITORY'
    );
    if (!hasPermission) {
      return {
        success: false,
        error: 'Bu işlem için yetkiniz yok',
      };
    }

    return this.noteRepository.update(teamId, id, {
      isPinned: !note.isPinned,
    });
  }
}

