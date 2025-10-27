import { IBaseEntity } from '../types/base.types';

// Team model - Ana team document
export interface ITeam extends IBaseEntity {
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  isActive: boolean;
  members: string[]; // User ID array
  taskIds: string[]; // Task ID array
  noteIds: string[]; // Note ID array
  todoIds: string[]; // Todo ID array
}

// Create Team DTO
export interface ICreateTeamDto {
  name: string;
  description?: string;
}

// Update Team DTO
export interface IUpdateTeamDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Assign Role DTO
export interface IAssignRoleDto {
  userId: string;
  roleId: string;
}

