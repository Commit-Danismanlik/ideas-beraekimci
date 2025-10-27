import {
  IPersonalNote,
  IPersonalTodo,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
} from '../models/PersonalRepository.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

// Personal Note Service Interface
export interface IPersonalNoteService {
  createNote(userId: string, dto: ICreateNoteDto): Promise<IQueryResult<IPersonalNote>>;
  getNoteById(id: string): Promise<IQueryResult<IPersonalNote>>;
  getUserNotes(userId: string): Promise<IListQueryResult<IPersonalNote>>;
  updateNote(id: string, dto: IUpdateNoteDto): Promise<IQueryResult<IPersonalNote>>;
  deleteNote(id: string): Promise<IQueryResult<boolean>>;
  
  getPinnedNotes(userId: string): Promise<IListQueryResult<IPersonalNote>>;
  togglePin(id: string): Promise<IQueryResult<IPersonalNote>>;
  getNotesByCategory(userId: string, category: string): Promise<IListQueryResult<IPersonalNote>>;
}

// Personal Todo Service Interface
export interface IPersonalTodoService {
  createTodo(userId: string, dto: ICreateTodoDto): Promise<IQueryResult<IPersonalTodo>>;
  getTodoById(id: string): Promise<IQueryResult<IPersonalTodo>>;
  getUserTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>>;
  updateTodo(id: string, dto: IUpdateTodoDto): Promise<IQueryResult<IPersonalTodo>>;
  deleteTodo(id: string): Promise<IQueryResult<boolean>>;
  
  getActiveTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>>;
  getCompletedTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>>;
  toggleComplete(id: string): Promise<IQueryResult<IPersonalTodo>>;
}

