import {
  ITeamNote,
  ITeamTodo,
  ICreateTeamNoteDto,
  IUpdateTeamNoteDto,
  ICreateTeamTodoDto,
  IUpdateTeamTodoDto,
} from '../models/TeamRepository.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

// Team Note Service Interface
export interface ITeamNoteService {
  createNote(
    teamId: string,
    userId: string,
    dto: ICreateTeamNoteDto
  ): Promise<IQueryResult<ITeamNote>>;
  getNoteById(teamId: string, id: string): Promise<IQueryResult<ITeamNote>>;
  getTeamNotes(teamId: string): Promise<IListQueryResult<ITeamNote>>;
  getRecentNotes(teamId: string, take: number): Promise<IListQueryResult<ITeamNote>>;
  getRecentNotesBefore(teamId: string, before: Date, take: number): Promise<IListQueryResult<ITeamNote>>;
  updateNote(
    teamId: string,
    id: string,
    userId: string,
    dto: IUpdateTeamNoteDto
  ): Promise<IQueryResult<ITeamNote>>;
  deleteNote(teamId: string, id: string, userId: string): Promise<IQueryResult<boolean>>;
  togglePin(teamId: string, id: string, userId: string): Promise<IQueryResult<ITeamNote>>;
}

// Team Todo Service Interface
export interface ITeamTodoService {
  createTodo(
    teamId: string,
    userId: string,
    dto: ICreateTeamTodoDto
  ): Promise<IQueryResult<ITeamTodo>>;
  getTodoById(teamId: string, id: string): Promise<IQueryResult<ITeamTodo>>;
  getTeamTodos(teamId: string): Promise<IListQueryResult<ITeamTodo>>;
  getRecentTodos(teamId: string, take: number): Promise<IListQueryResult<ITeamTodo>>;
  getRecentTodosBefore(teamId: string, before: Date, take: number): Promise<IListQueryResult<ITeamTodo>>;
  updateTodo(
    teamId: string,
    id: string,
    userId: string,
    dto: IUpdateTeamTodoDto
  ): Promise<IQueryResult<ITeamTodo>>;
  deleteTodo(teamId: string, id: string, userId: string): Promise<IQueryResult<boolean>>;
  toggleComplete(teamId: string, id: string, userId: string): Promise<IQueryResult<ITeamTodo>>;
}

