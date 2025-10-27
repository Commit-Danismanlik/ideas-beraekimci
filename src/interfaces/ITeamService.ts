import { ITeam, ICreateTeamDto, IUpdateTeamDto } from '../models/Team.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export interface ITeamService {
  createTeam(dto: ICreateTeamDto, ownerId: string): Promise<IQueryResult<ITeam>>;
  getTeamById(id: string): Promise<IQueryResult<ITeam>>;
  getAllTeams(): Promise<IListQueryResult<ITeam>>;
  updateTeam(id: string, dto: IUpdateTeamDto): Promise<IQueryResult<ITeam>>;
  deleteTeam(id: string): Promise<IQueryResult<boolean>>;
  
  // Takım işlemleri
  getUserTeams(userId: string): Promise<IListQueryResult<ITeam>>;
  joinTeam(teamId: string, userId: string): Promise<IQueryResult<ITeam>>;
  leaveTeam(teamId: string, userId: string): Promise<IQueryResult<ITeam>>;
  getTeamMembers(teamId: string): Promise<string[]>;
  
  // Rol atama işlemleri
  assignUserRole(teamId: string, userId: string, roleId: string, assignedBy: string): Promise<IQueryResult<boolean>>;
  getUserRole(teamId: string, userId: string): Promise<IQueryResult<string>>;
  
  // Üye yönetimi
  removeMember(teamId: string, userId: string, removedBy: string): Promise<IQueryResult<boolean>>;
}

