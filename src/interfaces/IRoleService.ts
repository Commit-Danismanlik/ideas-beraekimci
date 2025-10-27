import { IRole, ICreateRoleDto, IUpdateRoleDto, Permission } from '../models/Role.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export interface IRoleService {
  // Role CRUD
  createRole(teamId: string, dto: ICreateRoleDto, creatorId: string): Promise<IQueryResult<IRole>>;
  getRoleById(teamId: string, id: string): Promise<IQueryResult<IRole>>;
  getTeamRoles(teamId: string): Promise<IListQueryResult<IRole>>;
  updateRole(teamId: string, roleId: string, dto: IUpdateRoleDto, userId: string): Promise<IQueryResult<IRole>>;
  deleteRole(teamId: string, roleId: string, userId: string): Promise<IQueryResult<boolean>>;
  
  // Default roles
  createDefaultRoles(teamId: string): Promise<void>;
  getOwnerRole(teamId: string): Promise<IQueryResult<IRole>>;
  getAdminRole(teamId: string): Promise<IQueryResult<IRole>>; // Geriye dönük uyumluluk
  getMemberRole(teamId: string): Promise<IQueryResult<IRole>>;
  
  // Permissions
  hasPermission(userId: string, teamId: string, permission: Permission): Promise<boolean>;
  getUserPermissions(userId: string, teamId: string): Promise<Permission[]>;
}

