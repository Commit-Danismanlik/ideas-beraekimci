import { ITeamTodoService } from '../interfaces/ITeamRepositoryService';
import { IRoleService } from '../interfaces/IRoleService';
import { TeamTodoRepository } from '../repositories/TeamTodoRepository';
import { TeamRepository } from '../repositories/TeamRepository';
import {
  ITeamTodo,
  ICreateTeamTodoDto,
  IUpdateTeamTodoDto,
} from '../models/TeamRepository.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class TeamTodoService implements ITeamTodoService {
  private todoRepository: TeamTodoRepository;
  private teamRepository: TeamRepository;
  private roleService: IRoleService;

  constructor(
    todoRepository: TeamTodoRepository,
    teamRepository: TeamRepository,
    roleService: IRoleService
  ) {
    this.todoRepository = todoRepository;
    this.teamRepository = teamRepository;
    this.roleService = roleService;
  }

  // Create Todo
  public async createTodo(
    teamId: string,
    userId: string,
    dto: ICreateTeamTodoDto
  ): Promise<IQueryResult<ITeamTodo>> {
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
        error: 'Todo başlığı boş olamaz',
      };
    }

    const todoData = {
      createdBy: userId,
      assignedTo: dto.assignedTo,
      title: dto.title,
      description: dto.description,
      completed: dto.completed ?? false,
      priority: dto.priority || 'medium',
      dueDate: dto.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Todo'yu subcollection'a ekle
    const todoResult = await this.todoRepository.create(teamId, todoData);
    
    if (todoResult.success && todoResult.data) {
      // Team document'teki todoIds array'ine ekle
      const teamResult = await this.teamRepository.getById(teamId);
      if (teamResult.success && teamResult.data) {
        const updatedTodoIds = [...teamResult.data.todoIds, todoResult.data.id];
        await this.teamRepository.update(teamId, { todoIds: updatedTodoIds });
      }
    }

    return todoResult;
  }

  // Get Todo By Id
  public async getTodoById(teamId: string, id: string): Promise<IQueryResult<ITeamTodo>> {
    return this.todoRepository.getById(teamId, id);
  }

  // Get Team Todos
  public async getTeamTodos(teamId: string): Promise<IListQueryResult<ITeamTodo>> {
    return this.todoRepository.getAll(teamId);
  }

  // Performans: yakın tarihli todo'ları getir (limitli)
  public async getRecentTodos(teamId: string, take: number): Promise<IListQueryResult<ITeamTodo>> {
    if (!teamId || teamId.trim() === '' || take <= 0) {
      return { success: false, data: [], error: 'Geçersiz parametre', total: 0 };
    }
    return this.todoRepository.getRecent(teamId, take);
  }

  // Performans: belirli tarihten önceki todo'ları getir (limitli)
  public async getRecentTodosBefore(teamId: string, before: Date, take: number): Promise<IListQueryResult<ITeamTodo>> {
    if (!teamId || teamId.trim() === '' || take <= 0) {
      return { success: false, data: [], error: 'Geçersiz parametre', total: 0 };
    }
    return this.todoRepository.getRecentBefore(teamId, before, take);
  }

  // Update Todo
  public async updateTodo(
    teamId: string,
    id: string,
    userId: string,
    dto: IUpdateTeamTodoDto
  ): Promise<IQueryResult<ITeamTodo>> {
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

    return this.todoRepository.update(teamId, id, dto);
  }

  // Delete Todo
  public async deleteTodo(teamId: string, id: string, userId: string): Promise<IQueryResult<boolean>> {
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

    const deleteResult = await this.todoRepository.delete(teamId, id);
    
    if (deleteResult.success) {
      // Team document'teki todoIds array'inden çıkar
      const teamResult = await this.teamRepository.getById(teamId);
      if (teamResult.success && teamResult.data) {
        const updatedTodoIds = teamResult.data.todoIds.filter((todoId) => todoId !== id);
        await this.teamRepository.update(teamId, { todoIds: updatedTodoIds });
      }
    }

    return deleteResult;
  }

  // Toggle Complete
  public async toggleComplete(teamId: string, id: string, userId: string): Promise<IQueryResult<ITeamTodo>> {
    const todoResult = await this.todoRepository.getById(teamId, id);
    if (!todoResult.success || !todoResult.data) {
      return {
        success: false,
        error: 'Todo bulunamadı',
      };
    }

    const todo = todoResult.data;

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

    return this.todoRepository.update(teamId, id, {
      completed: !todo.completed,
    });
  }
}

