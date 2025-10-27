import { ITask, ICreateTaskDto, IUpdateTaskDto } from '../models/Task.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export interface ITaskService {
  createTask(dto: ICreateTaskDto & { teamId: string }): Promise<IQueryResult<ITask>>;
  getTaskById(teamId: string, id: string): Promise<IQueryResult<ITask>>;
  getAllTasks(): Promise<IListQueryResult<ITask>>;
  updateTask(teamId: string, id: string, dto: IUpdateTaskDto): Promise<IQueryResult<ITask>>;
  deleteTask(teamId: string, id: string): Promise<IQueryResult<boolean>>;
  
  // Task işlemleri
  getTasksByTeam(teamId: string): Promise<IListQueryResult<ITask>>;
  getTasksByAssignee(teamId: string, userId: string): Promise<IListQueryResult<ITask>>;
  getTasksByStatus(teamId: string, status: 'todo' | 'in-progress' | 'done'): Promise<IListQueryResult<ITask>>;
  assignTask(teamId: string, taskId: string, userId: string): Promise<IQueryResult<ITask>>;
  updateTaskStatus(teamId: string, taskId: string, status: 'todo' | 'in-progress' | 'done'): Promise<IQueryResult<ITask>>;
}

