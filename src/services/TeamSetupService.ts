import { IRoleService } from '../interfaces/IRoleService';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import { IQueryResult } from '../types/base.types';
import { getLogger } from './Logger';

/**
 * TeamSetupService
 * SOLID: Single Responsibility - Sadece takım kurulum işlemlerinden sorumlu
 * Separation of Concerns - TeamService'ten takım kurulum logic'ini ayırır
 */
export class TeamSetupService {
  private roleService: IRoleService;
  private teamMemberRepository: TeamMemberRepository;
  private logger = getLogger();

  constructor(roleService: IRoleService, teamMemberRepository: TeamMemberRepository) {
    this.roleService = roleService;
    this.teamMemberRepository = teamMemberRepository;
  }

  /**
   * Takım için varsayılan rolleri oluşturur
   * @param teamId - Takım ID
   * @returns Başarılı olursa true
   */
  public async createDefaultRoles(teamId: string): Promise<boolean> {
    try {
      this.logger.info('Varsayılan roller oluşturuluyor (Owner ve Member)...', { teamId });
      const result = await this.roleService.createDefaultRoles(teamId);
      
      if (!result.success) {
        this.logger.error('Varsayılan roller oluşturulamadı', { 
          teamId, 
          error: result.error 
        });
        return false;
      }

      this.logger.info('Varsayılan roller oluşturuldu', { teamId });
      return true;
    } catch (error) {
      this.logger.error('Varsayılan roller oluşturulamadı', { teamId, error });
      return false;
    }
  }

  /**
   * Owner rolünü getirir
   * @param teamId - Takım ID
   * @returns Owner rolü
   */
  public async getOwnerRole(teamId: string): Promise<IQueryResult<{ id: string }>> {
    try {
      this.logger.info('Owner rolü getiriliyor...', { teamId });
      const ownerRoleResult = await this.roleService.getOwnerRole(teamId);

      if (!ownerRoleResult.success || !ownerRoleResult.data) {
        this.logger.error('Owner rolü bulunamadı', { teamId, error: ownerRoleResult.error });
        return {
          success: false,
          error: ownerRoleResult.error || 'Owner rolü bulunamadı',
        };
      }

      this.logger.info('Owner rolü bulundu', { teamId, roleId: ownerRoleResult.data.id });
      return {
        success: true,
        data: { id: ownerRoleResult.data.id },
      };
    } catch (error) {
      this.logger.error('Owner rolü getirme hatası', { teamId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Owner rolü getirilemedi',
      };
    }
  }

  /**
   * Takım sahibini Owner rolüyle ekler
   * @param teamId - Takım ID
   * @param ownerId - Sahip kullanıcı ID
   * @param ownerRoleId - Owner rol ID
   * @returns Başarılı olursa true
   */
  public async addOwnerAsMember(
    teamId: string,
    ownerId: string,
    ownerRoleId: string
  ): Promise<boolean> {
    try {
      this.logger.info('Takım sahibi Owner rolüyle ekleniyor...', { teamId, ownerId });
      const now = new Date();
      const memberResult = await this.teamMemberRepository.create(teamId, {
        userId: ownerId,
        roleId: ownerRoleId,
        addedBy: ownerId,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      if (!memberResult.success) {
        this.logger.error('Owner üye olarak eklenemedi', {
          teamId,
          ownerId,
          error: memberResult.error,
        });
        return false;
      }

      this.logger.info('Takım sahibi başarıyla eklendi', { teamId, ownerId });
      return true;
    } catch (error) {
      this.logger.error('Owner ekleme hatası', { teamId, ownerId, error });
      return false;
    }
  }

  /**
   * Takım kurulumunu tamamlar
   * @param teamId - Takım ID
   * @param ownerId - Sahip kullanıcı ID
   * @returns Başarılı olursa true
   */
  public async setupTeam(teamId: string, ownerId: string): Promise<boolean> {
    try {
      // Varsayılan rolleri oluştur
      const rolesCreated = await this.createDefaultRoles(teamId);
      if (!rolesCreated) {
        return false;
      }

      // Owner rolünü getir
      const ownerRoleResult = await this.getOwnerRole(teamId);
      if (!ownerRoleResult.success || !ownerRoleResult.data) {
        return false;
      }

      // Owner'ı üye olarak ekle
      const ownerAdded = await this.addOwnerAsMember(teamId, ownerId, ownerRoleResult.data.id);
      if (!ownerAdded) {
        return false;
      }

      this.logger.info('Takım kurulumu tamamlandı! Owner rolü atandı.', { teamId, ownerId });
      return true;
    } catch (error) {
      this.logger.error('Takım kurulum exception', { teamId, ownerId, error });
      return false;
    }
  }
}

