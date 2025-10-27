import { IBaseEntity } from '../types/base.types';

// Team Note model - Subcollection içinde
export interface ITeamNote extends IBaseEntity {
  createdBy: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned: boolean;
}

// Team Todo model - Subcollection içinde
export interface ITeamTodo extends IBaseEntity {
  createdBy: string;
  assignedTo?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

// Create Team Note DTO
export interface ICreateTeamNoteDto {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Update Team Note DTO
export interface IUpdateTeamNoteDto {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Create Team Todo DTO
export interface ICreateTeamTodoDto {
  title: string;
  description?: string;
  assignedTo?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

// Update Team Todo DTO
export interface IUpdateTeamTodoDto {
  title?: string;
  description?: string;
  assignedTo?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

