import { IBaseEntity } from '../types/base.types';

// Task model - Subcollection içinde
export interface ITask extends IBaseEntity {
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  finishedAt?: Date;
}

// Create Task DTO
export interface ICreateTaskDto {
  title: string;
  description?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}

// Update Task DTO
export interface IUpdateTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  finishedAt?: Date;
}

