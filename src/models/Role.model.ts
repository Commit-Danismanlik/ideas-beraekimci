import { IBaseEntity } from '../types/base.types';

// Permission tipi
export type Permission =
  | 'CREATE_TASK'
  | 'EDIT_TASK'
  | 'DELETE_TASK'
  | 'ASSIGN_TASK'
  | 'CREATE_REPOSITORY'
  | 'EDIT_REPOSITORY'
  | 'DELETE_REPOSITORY'
  | 'MANAGE_ROLES'
  | 'MANAGE_MEMBERS'
  | 'INVITE_MEMBERS'
  | 'REMOVE_MEMBERS'
  | 'EDIT_TEAM'
  | 'DELETE_TEAM'
  | 'VIEW_TEAM_ID';

// Role model - Subcollection içinde
export interface IRole extends IBaseEntity {
  name: string;
  permissions: Permission[];
  isCustom: boolean;
  isDefault: boolean; // member, admin gibi varsayılan roller
  color?: string; // Custom roller için hex color (örn: #3B82F6)
}

// Team Member model - Subcollection içinde
export interface ITeamMember extends IBaseEntity {
  userId: string;
  roleId: string;
  addedBy: string;
  addedAt: Date;
}

// Create Role DTO
export interface ICreateRoleDto {
  name: string;
  permissions: Permission[];
  color?: string;
}

// Update Role DTO
export interface IUpdateRoleDto {
  name?: string;
  permissions?: Permission[];
  color?: string;
}

// Varsayılan roller için permission setleri
export const DEFAULT_PERMISSIONS = {
  OWNER: [
    'CREATE_TASK',
    'EDIT_TASK',
    'DELETE_TASK',
    'ASSIGN_TASK',
    'CREATE_REPOSITORY',
    'EDIT_REPOSITORY',
    'DELETE_REPOSITORY',
    'MANAGE_ROLES',
    'MANAGE_MEMBERS',
    'INVITE_MEMBERS',
    'REMOVE_MEMBERS',
    'EDIT_TEAM',
    'DELETE_TEAM',
    'VIEW_TEAM_ID',
  ] as Permission[],
  MEMBER: [] as Permission[], // Member sadece görüntüleme yapabilir, düzenleme/silme/oluşturma yetkisi yok
};

// Permission açıklamaları
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  CREATE_TASK: 'Görev oluşturabilir',
  EDIT_TASK: 'Görev düzenleyebilir',
  DELETE_TASK: 'Görev silebilir',
  ASSIGN_TASK: 'Görev atayabilir',
  CREATE_REPOSITORY: 'Repository oluşturabilir',
  EDIT_REPOSITORY: 'Repository düzenleyebilir',
  DELETE_REPOSITORY: 'Repository silebilir',
  MANAGE_ROLES: 'Rolleri yönetebilir',
  MANAGE_MEMBERS: 'Üyeleri yönetebilir',
  INVITE_MEMBERS: 'Üye davet edebilir',
  REMOVE_MEMBERS: 'Üye çıkarabilir',
  EDIT_TEAM: 'Takım bilgilerini düzenleyebilir',
  DELETE_TEAM: 'Takımı silebilir',
  VIEW_TEAM_ID: 'Takım ID\'sini görebilir',
};

