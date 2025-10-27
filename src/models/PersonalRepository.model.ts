import { IBaseEntity } from '../types/base.types';

// Personal Note model
export interface IPersonalNote extends IBaseEntity {
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned: boolean;
}

// Personal Todo model
export interface IPersonalTodo extends IBaseEntity {
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

// Create Note DTO
export interface ICreateNoteDto {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Update Note DTO
export interface IUpdateNoteDto {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Create Todo DTO
export interface ICreateTodoDto {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

// Update Todo DTO
export interface IUpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

