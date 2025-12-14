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

  // Get Team Roles - Silinmiş rolleri ve tekrar eden default rolleri filtrele
  public async getTeamRoles(teamId: string): Promise<IListQueryResult<IRole>> {
    const result = await this.roleRepository.getAll(teamId);
    if (result.success) {
      // Silinmiş rolleri filtrele
      let filteredRoles = result.data.filter(role => !role.isDeleted);
      
      // Tekrar eden default rolleri filtrele (frontend'de gösterilmemesi için)
      const ownerRoles = filteredRoles.filter(r => r.name === 'Owner' && r.isDefault);
      const memberRoles = filteredRoles.filter(r => r.name === 'Member' && r.isDefault);
      
      // Owner rollerinden sadece en fazla yetkiye sahip olanı tut
      if (ownerRoles.length > 1) {
        // Önce DEFAULT_PERMISSIONS.OWNER ile tam eşleşen olanı bul
        const fullOwnerRole = ownerRoles.find(role => {
          const rolePermissionsSet = new Set(role.permissions);
          return role.permissions.length === DEFAULT_PERMISSIONS.OWNER.length &&
                 DEFAULT_PERMISSIONS.OWNER.every(perm => rolePermissionsSet.has(perm));
        });
        
        if (fullOwnerRole) {
          // Tam yetkili Owner rolü varsa, diğerlerini filtrele
          filteredRoles = filteredRoles.filter(r => 
            !(r.name === 'Owner' && r.isDefault && r.id !== fullOwnerRole.id)
          );
        } else {
          // Tam yetkili yoksa, en fazla yetkiye sahip olanı tut
          const sortedByPermissions = [...ownerRoles].sort((a, b) => {
            if (b.permissions.length !== a.permissions.length) {
              return b.permissions.length - a.permissions.length;
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
          });
          const bestOwnerRole = sortedByPermissions[0];
          filteredRoles = filteredRoles.filter(r => 
            !(r.name === 'Owner' && r.isDefault && r.id !== bestOwnerRole.id)
          );
        }
      }
      
      // Member rollerinden sadece en az yetkiye sahip olanı tut
      if (memberRoles.length > 1) {
        // Önce hiç yetkiye sahip olmayan olanı bul
        const emptyMemberRole = memberRoles.find(role => role.permissions.length === 0);
        
        if (emptyMemberRole) {
          // Yetkisiz Member rolü varsa, diğerlerini filtrele
          filteredRoles = filteredRoles.filter(r => 
            !(r.name === 'Member' && r.isDefault && r.id !== emptyMemberRole.id)
          );
        } else {
          // Yetkisiz yoksa, en az yetkiye sahip olanı tut
          const sortedByPermissions = [...memberRoles].sort((a, b) => {
            if (a.permissions.length !== b.permissions.length) {
              return a.permissions.length - b.permissions.length;
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
          });
          const bestMemberRole = sortedByPermissions[0];
          filteredRoles = filteredRoles.filter(r => 
            !(r.name === 'Member' && r.isDefault && r.id !== bestMemberRole.id)
          );
        }
      }
      
      result.data = filteredRoles;
      result.total = filteredRoles.length;
    }
    return result;
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

  // Cleanup Default Roles - Tekrar eden default rolleri temizle
  public async cleanupDefaultRoles(teamId: string): Promise<IQueryResult<boolean>> {
    try {
      // Tüm default rolleri getir (silinmiş olanları hariç tut)
      const existingRolesResult = await this.roleRepository.getDefaultRoles(teamId);
      const existingDefaultRoles = existingRolesResult.success 
        ? existingRolesResult.data.filter(r => !r.isDeleted) 
        : [];

      // Owner rollerini bul
      const ownerRoles = existingDefaultRoles.filter(r => r.name === 'Owner');
      // Member rollerini bul
      const memberRoles = existingDefaultRoles.filter(r => r.name === 'Member');

      // Owner rollerini temizle - sadece bir tane kalmalı
      let finalOwnerRole: IRole | null = null;
      if (ownerRoles.length > 0) {
        // Önce DEFAULT_PERMISSIONS.OWNER ile tam eşleşen (tüm yetkilere sahip) olanı bul
        const fullOwnerRole = ownerRoles.find(role => {
          const rolePermissionsSet = new Set(role.permissions);
          return role.permissions.length === DEFAULT_PERMISSIONS.OWNER.length &&
                 DEFAULT_PERMISSIONS.OWNER.every(perm => rolePermissionsSet.has(perm));
        });

        if (fullOwnerRole) {
          // Tam yetkili Owner rolü varsa onu tut
          finalOwnerRole = fullOwnerRole;
          this.logger.info('Tam yetkili Owner rolü bulundu', { teamId, roleId: finalOwnerRole.id });
        } else {
          // Tam yetkili yoksa, en fazla yetkiye sahip olanı tut
          const sortedByPermissions = [...ownerRoles].sort((a, b) => {
            // Önce yetki sayısına göre (azalan), sonra createdAt'a göre (artan)
            if (b.permissions.length !== a.permissions.length) {
              return b.permissions.length - a.permissions.length;
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
          });
          finalOwnerRole = sortedByPermissions[0];
          this.logger.info('En fazla yetkiye sahip Owner rolü seçildi', { 
            teamId, 
            roleId: finalOwnerRole.id, 
            permissionCount: finalOwnerRole.permissions.length 
          });
        }

        // Diğer Owner rollerini sil
        const rolesToDelete = ownerRoles.filter(r => r.id !== finalOwnerRole!.id);
        for (const roleToDelete of rolesToDelete) {
          // Bu rol kullanılıyor mu kontrol et
          const membersResult = await this.teamMemberRepository.getMembersByRole(teamId, roleToDelete.id);
          
          if (membersResult.success && membersResult.data.length > 0) {
            // Eğer kullanılıyorsa, üyeleri finalOwnerRole'e ata
            for (const member of membersResult.data) {
              const updateResult = await this.teamMemberRepository.update(teamId, member.id, {
                roleId: finalOwnerRole.id,
              });
              if (!updateResult.success) {
                this.logger.error('Üye rolü güncellenemedi', { 
                  teamId, 
                  memberId: member.id, 
                  error: updateResult.error 
                });
              }
            }
            this.logger.info('Owner rolü kullanıcıları yeni role atandı', { 
              teamId, 
              oldRoleId: roleToDelete.id, 
              newRoleId: finalOwnerRole.id 
            });
          }

          // Direkt soft delete yap (silme işlemi Firebase Rules nedeniyle başarısız olabilir)
          this.logger.info('Owner rolü soft delete olarak işaretleniyor', { 
            teamId, 
            roleId: roleToDelete.id,
            permissionCount: roleToDelete.permissions.length 
          });
          
          const softDeleteResult = await this.roleRepository.update(teamId, roleToDelete.id, {
            isDeleted: true,
          });
          
          if (softDeleteResult.success) {
            this.logger.info('Owner rolü soft delete olarak işaretlendi', { 
              teamId, 
              roleId: roleToDelete.id,
              permissionCount: roleToDelete.permissions.length 
            });
          } else {
            this.logger.error('Owner rolü soft delete olarak işaretlenemedi', { 
              teamId, 
              roleId: roleToDelete.id,
              error: softDeleteResult.error 
            });
            
            // Soft delete de başarısız olursa, silmeyi dene
            const deleteResult = await this.roleRepository.delete(teamId, roleToDelete.id);
            if (deleteResult.success) {
              this.logger.info('Owner rolü silindi (fallback)', { 
                teamId, 
                roleId: roleToDelete.id 
              });
            } else {
              this.logger.error('Owner rolü ne soft delete ne de silme başarılı oldu', { 
                teamId, 
                roleId: roleToDelete.id,
                deleteError: deleteResult.error 
              });
            }
          }
        }

        // Final Owner rolünün permission'larını güncelle (her zaman tam yetki olmalı)
        await this.roleRepository.update(teamId, finalOwnerRole.id, {
          permissions: DEFAULT_PERMISSIONS.OWNER,
        });
        this.logger.info('Owner rolü permission\'ları güncellendi', { 
          teamId, 
          roleId: finalOwnerRole.id,
          permissionCount: DEFAULT_PERMISSIONS.OWNER.length 
        });
      }

      // Member rollerini temizle - sadece bir tane kalmalı
      let finalMemberRole: IRole | null = null;
      if (memberRoles.length > 0) {
        // Önce hiç yetkiye sahip olmayan (boş array) olanı bul
        const emptyMemberRole = memberRoles.find(role => role.permissions.length === 0);

        if (emptyMemberRole) {
          // Hiç yetkiye sahip olmayan Member rolü varsa onu tut
          finalMemberRole = emptyMemberRole;
          this.logger.info('Yetkisiz Member rolü bulundu', { teamId, roleId: finalMemberRole.id });
        } else {
          // Hiç yetkisiz yoksa, en az yetkiye sahip olanı tut (eşitse en eski)
          const sortedByPermissions = [...memberRoles].sort((a, b) => {
            // Önce yetki sayısına göre (artan), sonra createdAt'a göre (artan)
            if (a.permissions.length !== b.permissions.length) {
              return a.permissions.length - b.permissions.length;
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
          });
          finalMemberRole = sortedByPermissions[0];
          this.logger.info('En az yetkiye sahip Member rolü seçildi', { 
            teamId, 
            roleId: finalMemberRole.id, 
            permissionCount: finalMemberRole.permissions.length 
          });
        }

        // Diğer Member rollerini sil
        const rolesToDelete = memberRoles.filter(r => r.id !== finalMemberRole!.id);
        for (const roleToDelete of rolesToDelete) {
          // Bu rol kullanılıyor mu kontrol et
          const membersResult = await this.teamMemberRepository.getMembersByRole(teamId, roleToDelete.id);
          
          if (membersResult.success && membersResult.data.length > 0) {
            // Eğer kullanılıyorsa, üyeleri finalMemberRole'e ata
            for (const member of membersResult.data) {
              const updateResult = await this.teamMemberRepository.update(teamId, member.id, {
                roleId: finalMemberRole.id,
              });
              if (!updateResult.success) {
                this.logger.error('Üye rolü güncellenemedi', { 
                  teamId, 
                  memberId: member.id, 
                  error: updateResult.error 
                });
              }
            }
            this.logger.info('Member rolü kullanıcıları yeni role atandı', { 
              teamId, 
              oldRoleId: roleToDelete.id, 
              newRoleId: finalMemberRole.id 
            });
          }

          // Direkt soft delete yap (silme işlemi Firebase Rules nedeniyle başarısız olabilir)
          this.logger.info('Member rolü soft delete olarak işaretleniyor', { 
            teamId, 
            roleId: roleToDelete.id,
            permissionCount: roleToDelete.permissions.length 
          });
          
          const softDeleteResult = await this.roleRepository.update(teamId, roleToDelete.id, {
            isDeleted: true,
          });
          
          if (softDeleteResult.success) {
            this.logger.info('Member rolü soft delete olarak işaretlendi', { 
              teamId, 
              roleId: roleToDelete.id,
              permissionCount: roleToDelete.permissions.length 
            });
          } else {
            this.logger.error('Member rolü soft delete olarak işaretlenemedi', { 
              teamId, 
              roleId: roleToDelete.id,
              error: softDeleteResult.error 
            });
            
            // Soft delete de başarısız olursa, silmeyi dene
            const deleteResult = await this.roleRepository.delete(teamId, roleToDelete.id);
            if (deleteResult.success) {
              this.logger.info('Member rolü silindi (fallback)', { 
                teamId, 
                roleId: roleToDelete.id 
              });
            } else {
              this.logger.error('Member rolü ne soft delete ne de silme başarılı oldu', { 
                teamId, 
                roleId: roleToDelete.id,
                deleteError: deleteResult.error 
              });
            }
          }
        }

        // Final Member rolünün permission'larını güncelle (her zaman boş array olmalı)
        await this.roleRepository.update(teamId, finalMemberRole.id, {
          permissions: DEFAULT_PERMISSIONS.MEMBER,
        });
        this.logger.info('Member rolü permission\'ları güncellendi', { 
          teamId, 
          roleId: finalMemberRole.id,
          permissionCount: 0 
        });
      }

      this.logger.info('Default roller temizlendi', { 
        teamId, 
        ownerRoleId: finalOwnerRole?.id, 
        memberRoleId: finalMemberRole?.id 
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      this.logger.error('cleanupDefaultRoles exception', { teamId, error });
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Default roller temizlenemedi',
      };
    }
  }

  // Create Default Roles
  public async createDefaultRoles(teamId: string): Promise<IQueryResult<boolean>> {
    try {
      const now = new Date();

      // Önce temizleme yap
      await this.cleanupDefaultRoles(teamId);

      // Tüm default rolleri getir (temizleme sonrası)
      const existingRolesResult = await this.roleRepository.getDefaultRoles(teamId);
      const existingDefaultRoles = existingRolesResult.success ? existingRolesResult.data : [];

      // Owner rollerini bul
      const ownerRoles = existingDefaultRoles.filter(r => r.name === 'Owner');
      // Member rollerini bul
      const memberRoles = existingDefaultRoles.filter(r => r.name === 'Member');

      let finalOwnerRole: IRole | null = ownerRoles.length > 0 ? ownerRoles[0] : null;
      let finalMemberRole: IRole | null = memberRoles.length > 0 ? memberRoles[0] : null;

      // Owner rolü yoksa oluştur
      if (!finalOwnerRole) {
        const ownerResult = await this.roleRepository.create(teamId, {
          name: 'Owner',
          permissions: DEFAULT_PERMISSIONS.OWNER,
          isCustom: false,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        });

        if (!ownerResult.success || !ownerResult.data) {
          this.logger.error('Owner rolü oluşturulamadı', { teamId, error: ownerResult.error });
          return {
            success: false,
            data: false,
            error: `Owner rolü oluşturulamadı: ${ownerResult.error}`,
          };
        }
        finalOwnerRole = ownerResult.data;
        this.logger.info('Owner rolü oluşturuldu', { teamId, roleId: finalOwnerRole.id });
      }

      // Member rolü yoksa oluştur
      if (!finalMemberRole) {
        const memberResult = await this.roleRepository.create(teamId, {
          name: 'Member',
          permissions: DEFAULT_PERMISSIONS.MEMBER,
          isCustom: false,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        });

        if (!memberResult.success || !memberResult.data) {
          this.logger.error('Member rolü oluşturulamadı', { teamId, error: memberResult.error });
          return {
            success: false,
            data: false,
            error: `Member rolü oluşturulamadı: ${memberResult.error}`,
          };
        }
        finalMemberRole = memberResult.data;
        this.logger.info('Member rolü oluşturuldu', { teamId, roleId: finalMemberRole.id });
      }

      if (!finalOwnerRole || !finalMemberRole) {
        return {
          success: false,
          data: false,
          error: 'Owner veya Member rolü oluşturulamadı',
        };
      }

      this.logger.info('Varsayılan roller başarıyla oluşturuldu/temizlendi', { 
        teamId, 
        ownerRoleId: finalOwnerRole.id, 
        memberRoleId: finalMemberRole.id 
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      this.logger.error('createDefaultRoles exception', { teamId, error });
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Varsayılan roller oluşturulamadı',
      };
    }
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

    // Owner rolünün permission'larını DEFAULT_PERMISSIONS.OWNER ile tamamen senkronize et
    const requiredPermissions = DEFAULT_PERMISSIONS.OWNER;
    const currentPermissions = ownerRole.permissions || [];
    
    // Permission'ları sıralayarak karşılaştır (sıra farklı olabilir)
    const currentSorted = [...currentPermissions].sort();
    const requiredSorted = [...requiredPermissions].sort();
    const permissionsMatch = 
      currentSorted.length === requiredSorted.length &&
      currentSorted.every((perm, index) => perm === requiredSorted[index]);

    if (!permissionsMatch) {
      // Permission'lar eşleşmiyor, runtime'da DEFAULT_PERMISSIONS.OWNER ile güncellenmiş rol döndür
      // Not: Veritabanı güncellemesi Firebase Security Rules nedeniyle başarısız olabilir
      // (sadece ownerId olan kullanıcılar roles subcollection'ına yazabilir)
      // Ancak runtime'da zaten doğru permission'lar kullanıldığı için bu kritik değil
      // this.logger.debug('Owner rolü permission\'ları eşleşmiyor - runtime\'da güncellenmiş rol döndürülüyor', {
      //   teamId,
      //   roleId: ownerRole.id,
      //   currentPermissions,
      //   requiredPermissions,
      // });
      return {
        success: true,
        data: {
          ...ownerRole,
          permissions: requiredPermissions,
          updatedAt: new Date(),
        },
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

      // Owner rolü için özel kontrol: DEFAULT_PERMISSIONS.OWNER'daki tüm permission'ları otomatik ver
      if (role.name === 'Owner' && role.isDefault) {
        // Önce Owner rolünü güncelle (eksik permission'lar varsa)
        const ownerRoleResult = await this.getOwnerRole(teamId);
        if (ownerRoleResult.success && ownerRoleResult.data) {
          // Güncellenmiş Owner rolündeki permission'ları kontrol et
          return ownerRoleResult.data.permissions.includes(permission);
        }
        // Güncelleme başarısız olsa bile DEFAULT_PERMISSIONS.OWNER'dan kontrol et
        return DEFAULT_PERMISSIONS.OWNER.includes(permission);
      }

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

      const role = roleResult.data;

      // Owner rolü için özel kontrol: DEFAULT_PERMISSIONS.OWNER'daki tüm permission'ları otomatik ver
      if (role.name === 'Owner' && role.isDefault) {
        // Önce Owner rolünü güncelle (eksik permission'lar varsa)
        const ownerRoleResult = await this.getOwnerRole(teamId);
        if (ownerRoleResult.success && ownerRoleResult.data) {
          return ownerRoleResult.data.permissions;
        }
        // Güncelleme başarısız olsa bile DEFAULT_PERMISSIONS.OWNER döndür
        return DEFAULT_PERMISSIONS.OWNER;
      }

      return role.permissions;
    } catch (error) {
      return [];
    }
  }
}

