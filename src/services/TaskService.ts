import { ITaskService } from '../interfaces/ITaskService';
import { TaskRepository } from '../repositories/TaskRepository';
import { TeamRepository } from '../repositories/TeamRepository';
import { ITask, ICreateTaskDto, IUpdateTaskDto } from '../models/Task.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class TaskService implements ITaskService {
  private taskRepository: TaskRepository;
  private teamRepository: TeamRepository;

  constructor(taskRepository: TaskRepository, teamRepository: TeamRepository) {
    this.taskRepository = taskRepository;
    this.teamRepository = teamRepository;
  }

  // Create Task
  public async createTask(dto: ICreateTaskDto & { teamId: string }): Promise<IQueryResult<ITask>> {
    if (!dto.title || dto.title.trim() === '') {
      return {
        success: false,
        error: 'Görev başlığı boş olamaz',
      };
    }

    if (!dto.teamId || dto.teamId.trim() === '') {
      return {
        success: false,
        error: 'Takım ID gereklidir',
      };
    }

    const taskData = {
      title: dto.title,
      description: dto.description,
      assignedTo: dto.assignedTo,
      status: dto.status || 'todo',
      priority: dto.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Task'ı subcollection'a ekle
    const taskResult = await this.taskRepository.create(dto.teamId, taskData);
    
    if (taskResult.success && taskResult.data) {
      // Team document'teki taskIds array'ine ekle
      const teamResult = await this.teamRepository.getById(dto.teamId);
      if (teamResult.success && teamResult.data) {
        const updatedTaskIds = [...teamResult.data.taskIds, taskResult.data.id];
        await this.teamRepository.update(dto.teamId, { taskIds: updatedTaskIds });
      }
    }

    return taskResult;
  }

  // Get Task By Id
  public async getTaskById(teamId: string, id: string): Promise<IQueryResult<ITask>> {
    if (!id || id.trim() === '' || !teamId) {
      return {
        success: false,
        error: 'Geçersiz görev veya takım ID',
      };
    }
    return this.taskRepository.getById(teamId, id);
  }

  // Get All Tasks - Tüm takımlardaki taskları getirmek için kullanılmaz (subcollection)
  public async getAllTasks(): Promise<IListQueryResult<ITask>> {
    // Subcollection yapısında tüm taskları getirmek mantıklı değil
    return {
      success: false,
      data: [],
      error: 'Tüm taskları getirmek için teamId gereklidir',
      total: 0,
    };
  }

  // Update Task
  public async updateTask(teamId: string, id: string, dto: IUpdateTaskDto): Promise<IQueryResult<ITask>> {
    if (!id || id.trim() === '' || !teamId) {
      return {
        success: false,
        error: 'Geçersiz görev veya takım ID',
      };
    }

    // Eğer status 'done' olarak değiştiriliyorsa finishedAt ekle
    if (dto.status === 'done') {
      dto.finishedAt = new Date();
    }

    return this.taskRepository.update(teamId, id, dto);
  }

  // Delete Task
  public async deleteTask(teamId: string, id: string): Promise<IQueryResult<boolean>> {
    if (!id || id.trim() === '' || !teamId) {
      return {
        success: false,
        data: false,
        error: 'Geçersiz görev veya takım ID',
      };
    }

    const deleteResult = await this.taskRepository.delete(teamId, id);
    
    if (deleteResult.success) {
      // Team document'teki taskIds array'inden çıkar
      const teamResult = await this.teamRepository.getById(teamId);
      if (teamResult.success && teamResult.data) {
        const updatedTaskIds = teamResult.data.taskIds.filter((taskId) => taskId !== id);
        await this.teamRepository.update(teamId, { taskIds: updatedTaskIds });
      }
    }

    return deleteResult;
  }

  // Get Tasks By Team
  public async getTasksByTeam(teamId: string): Promise<IListQueryResult<ITask>> {
    if (!teamId || teamId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz takım ID',
        total: 0,
      };
    }

    return this.taskRepository.getAll(teamId);
  }

  // Get Tasks By Assignee
  public async getTasksByAssignee(teamId: string, userId: string): Promise<IListQueryResult<ITask>> {
    if (!userId || userId.trim() === '' || !teamId) {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı veya takım ID',
        total: 0,
      };
    }

    return this.taskRepository.getTasksByAssignee(teamId, userId);
  }

  // Get Tasks By Status
  public async getTasksByStatus(
    teamId: string,
    status: 'todo' | 'in-progress' | 'done'
  ): Promise<IListQueryResult<ITask>> {
    if (!teamId || teamId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz takım ID',
        total: 0,
      };
    }

    return this.taskRepository.getTasksByStatus(teamId, status);
  }

  // Assign Task
  public async assignTask(teamId: string, taskId: string, userId: string): Promise<IQueryResult<ITask>> {
    return this.updateTask(teamId, taskId, { assignedTo: userId });
  }

  // Update Task Status
  public async updateTaskStatus(
    teamId: string,
    taskId: string,
    status: 'todo' | 'in-progress' | 'done'
  ): Promise<IQueryResult<ITask>> {
    const updateData: IUpdateTaskDto = { status };
    if (status === 'done') {
      updateData.finishedAt = new Date();
    }
    return this.updateTask(teamId, taskId, updateData);
  }
}

