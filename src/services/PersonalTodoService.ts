import { IPersonalTodoService } from '../interfaces/IPersonalRepositoryService';
import { PersonalTodoRepository } from '../repositories/PersonalTodoRepository';
import {
  IPersonalTodo,
  ICreateTodoDto,
  IUpdateTodoDto,
} from '../models/PersonalRepository.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class PersonalTodoService implements IPersonalTodoService {
  private todoRepository: PersonalTodoRepository;

  constructor(todoRepository: PersonalTodoRepository) {
    this.todoRepository = todoRepository;
  }

  // Create Todo
  public async createTodo(
    userId: string,
    dto: ICreateTodoDto
  ): Promise<IQueryResult<IPersonalTodo>> {
    if (!dto.title || dto.title.trim() === '') {
      return {
        success: false,
        error: 'Todo başlığı boş olamaz',
      };
    }

    const todoData = {
      userId,
      title: dto.title,
      description: dto.description,
      completed: dto.completed ?? false,
      priority: dto.priority || 'medium',
      dueDate: dto.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.todoRepository.create(todoData);
  }

  // Get Todo By Id
  public async getTodoById(id: string): Promise<IQueryResult<IPersonalTodo>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz todo ID',
      };
    }
    return this.todoRepository.getById(id);
  }

  // Get User Todos
  public async getUserTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    return this.todoRepository.getTodosByUser(userId);
  }

  // Update Todo
  public async updateTodo(
    id: string,
    dto: IUpdateTodoDto
  ): Promise<IQueryResult<IPersonalTodo>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz todo ID',
      };
    }

    const exists = await this.todoRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        error: 'Todo bulunamadı',
      };
    }

    return this.todoRepository.update(id, dto);
  }

  // Delete Todo
  public async deleteTodo(id: string): Promise<IQueryResult<boolean>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        data: false,
        error: 'Geçersiz todo ID',
      };
    }

    const exists = await this.todoRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        data: false,
        error: 'Todo bulunamadı',
      };
    }

    return this.todoRepository.delete(id);
  }

  // Get Active Todos
  public async getActiveTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    return this.todoRepository.getActiveTodos(userId);
  }

  // Get Completed Todos
  public async getCompletedTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    return this.todoRepository.getCompletedTodos(userId);
  }

  // Toggle Complete
  public async toggleComplete(id: string): Promise<IQueryResult<IPersonalTodo>> {
    const todoResult = await this.todoRepository.getById(id);
    if (!todoResult.success || !todoResult.data) {
      return {
        success: false,
        error: 'Todo bulunamadı',
      };
    }

    return this.todoRepository.update(id, {
      completed: !todoResult.data.completed,
    });
  }
}

