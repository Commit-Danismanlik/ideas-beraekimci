import { IRoleService } from '../interfaces/IRoleService';
import { RoleRepository } from '../repositories/RoleRepository';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import {
  IRole,
  ICreateRoleDto,
  IUpdateRoleDto,
  Permission,
  DEFAULT_PERMISSIONS,
} from '../models/Role.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';
import { getLogger } from './Logger';

export class RoleService implements IRoleService {
  private roleRepository: RoleRepository;
  private teamMemberRepository: TeamMemberRepository;
  private logger = getLogger();

  constructor(roleRepository: RoleRepository, teamMemberRepository: TeamMemberRepository) {
    this.roleRepository = roleRepository;
    this.teamMemberRepository = teamMemberRepository;
  }

  // Create Role - Custom roller için herkes oluşturabilir (sadece üyelik kontrolü)
  public async createRole(
    teamId: string,
    dto: ICreateRoleDto,
    creatorId: string
  ): Promise<IQueryResult<IRole>> {
    if (!dto.name || dto.name.trim() === '') {
      return {
        success: false,
        error: 'Rol adı boş olamaz',
      };
    }

    try {
      // Takım var mı kontrol et
      const teamResult = await this.teamMemberRepository.getMemberByUserId(teamId, creatorId);
      this.logger.debug('Üyelik kontrolü yapılıyor', { teamId, userId: creatorId });
      this.logger.debug('Üyelik sonucu', { teamId, result: teamResult });

      // Eğer subcollection'da yoksa, team.members array'ine bak
      const roleData = {
        name: dto.name,
        permissions: dto.permissions,
        isCustom: true,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.logger.info('Custom rol oluşturuluyor', { teamId, roleData });
      const result = await this.roleRepository.create(teamId, roleData);

      if (result.success) {
        this.logger.info('Custom rol başarıyla oluşturuldu', { teamId, roleId: result.data?.id });
      } else {
        this.logger.error('Custom rol oluşturma hatası', { teamId, error: result.error });
      }

      return result;
    } catch (error) {
      this.logger.error('createRole exception', { teamId, creatorId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rol oluşturulamadı',
      };
    }
  }

  // Get Role By Id
  public async getRoleById(teamId: string, id: string): Promise<IQueryResult<IRole>> {
    return this.roleRepository.getById(teamId, id);
  }

  // Get Team Roles
  public async getTeamRoles(teamId: string): Promise<IListQueryResult<IRole>> {
    return this.roleRepository.getAll(teamId);
  }

  // Update Role - Custom roller için permission kontrolü YOK (herkes düzenleyebilir)
  public async updateRole(
    teamId: string,
    roleId: string,
    dto: IUpdateRoleDto,
    userId: string
  ): Promise<IQueryResult<IRole>> {
    // Rolü getir
    const roleResult = await this.roleRepository.getById(teamId, roleId);
    if (!roleResult.success || !roleResult.data) {
      return {
        success: false,
        error: 'Rol bulunamadı',
      };
    }

    const role = roleResult.data;

    // Varsayılan roller (Owner, Member) düzenlenemez
    if (role.isDefault) {
      return {
        success: false,
        error: 'Varsayılan roller (Owner, Member) düzenlenemez',
      };
    }

    // Takım üyesi mi kontrol et
    const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);
    if (!memberResult.success || memberResult.data.length === 0) {
      return {
        success: false,
        error: 'Bu takımın üyesi değilsiniz',
      };
    }

    this.logger.info('Custom rol güncelleniyor', { teamId, roleId, dto });
    return this.roleRepository.update(teamId, roleId, dto);
  }

  // Delete Role - Custom roller için permission kontrolü YOK (herkes silebilir)
  public async deleteRole(
    teamId: string,
    roleId: string,
    userId: string
  ): Promise<IQueryResult<boolean>> {
    // Rolü getir
    const roleResult = await this.roleRepository.getById(teamId, roleId);
    if (!roleResult.success || !roleResult.data) {
      return {
        success: false,
        data: false,
        error: 'Rol bulunamadı',
      };
    }

    const role = roleResult.data;

    // Varsayılan roller (Owner, Member) silinemez
    if (role.isDefault) {
      return {
        success: false,
        data: false,
        error: 'Varsayılan roller (Owner, Member) silinemez',
      };
    }

    // Takım üyesi mi kontrol et
    const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);
    if (!memberResult.success || memberResult.data.length === 0) {
      return {
        success: false,
        data: false,
        error: 'Bu takımın üyesi değilsiniz',
      };
    }

    // Bu role sahip üye var mı kontrol et
    const membersResult = await this.teamMemberRepository.getMembersByRole(teamId, roleId);
    if (membersResult.success && membersResult.data.length > 0) {
      return {
        success: false,
        data: false,
        error: 'Bu role atanmış üyeler var, önce onları başka bir role atayın',
      };
    }

    this.logger.info('Custom rol siliniyor', { teamId, roleId });
    return this.roleRepository.delete(teamId, roleId);
  }

  // Create Default Roles
  public async createDefaultRoles(teamId: string): Promise<void> {
    const now = new Date();

    // Owner rolü - subcollection olarak (takım sahibine özel, tüm yetkiler)
    await this.roleRepository.create(teamId, {
      name: 'Owner',
      permissions: DEFAULT_PERMISSIONS.OWNER,
      isCustom: false,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });

    // Member rolü - subcollection olarak (varsayılan üye rolü)
    await this.roleRepository.create(teamId, {
      name: 'Member',
      permissions: DEFAULT_PERMISSIONS.MEMBER,
      isCustom: false,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Get Owner Role
  public async getOwnerRole(teamId: string): Promise<IQueryResult<IRole>> {
    const rolesResult = await this.roleRepository.getDefaultRoles(teamId);
    if (!rolesResult.success) {
      return {
        success: false,
        error: 'Owner rolü bulunamadı',
      };
    }

    const ownerRole = rolesResult.data.find((r) => r.name === 'Owner');
    if (!ownerRole) {
      return {
        success: false,
        error: 'Owner rolü bulunamadı',
      };
    }

    return {
      success: true,
      data: ownerRole,
    };
  }

  // Get Admin Role - Geriye dönük uyumluluk için (Owner rolünü döndürür)
  public async getAdminRole(teamId: string): Promise<IQueryResult<IRole>> {
    return this.getOwnerRole(teamId);
  }

  // Get Member Role
  public async getMemberRole(teamId: string): Promise<IQueryResult<IRole>> {
    const rolesResult = await this.roleRepository.getDefaultRoles(teamId);
    if (!rolesResult.success) {
      return {
        success: false,
        error: 'Member rolü bulunamadı',
      };
    }

    const memberRole = rolesResult.data.find((r) => r.name === 'Member');
    if (!memberRole) {
      return {
        success: false,
        error: 'Member rolü bulunamadı',
      };
    }

    return {
      success: true,
      data: memberRole,
    };
  }

  // Has Permission
  public async hasPermission(
    userId: string,
    teamId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      // Kullanıcının takımdaki üyeliğini getir
      const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);

      if (!memberResult.success || memberResult.data.length === 0) {
        return false;
      }

      const member = memberResult.data[0];

      // Kullanıcının rolünü getir
      const roleResult = await this.roleRepository.getById(teamId, member.roleId);
      if (!roleResult.success || !roleResult.data) {
        return false;
      }

      const role = roleResult.data;

      // Permission kontrolü
      return role.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  }

  // Get User Permissions
  public async getUserPermissions(userId: string, teamId: string): Promise<Permission[]> {
    try {
      // Kullanıcının takımdaki üyeliğini getir
      const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);

      if (!memberResult.success || memberResult.data.length === 0) {
        return [];
      }

      const member = memberResult.data[0];

      // Kullanıcının rolünü getir
      const roleResult = await this.roleRepository.getById(teamId, member.roleId);
      if (!roleResult.success || !roleResult.data) {
        return [];
      }

      return roleResult.data.permissions;
    } catch (error) {
      return [];
    }
  }
}

