import { ITeamService } from '../interfaces/ITeamService';
import { IRoleService } from '../interfaces/IRoleService';
import { TeamRepository } from '../repositories/TeamRepository';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import { ITeam, ICreateTeamDto, IUpdateTeamDto, DEFAULT_CHATBOT_RULES } from '../models/Team.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';
import { TeamSetupService } from './TeamSetupService';
import { getLogger } from './Logger';

export class TeamService implements ITeamService {
  private teamRepository: TeamRepository;
  private teamMemberRepository: TeamMemberRepository;
  private roleService: IRoleService;
  private teamSetupService: TeamSetupService;
  private logger = getLogger();

  constructor(
    teamRepository: TeamRepository,
    teamMemberRepository: TeamMemberRepository,
    roleService: IRoleService
  ) {
    this.teamRepository = teamRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.roleService = roleService;
    this.teamSetupService = new TeamSetupService(roleService, teamMemberRepository);
  }

  // Create Team
  public async createTeam(dto: ICreateTeamDto, ownerId: string): Promise<IQueryResult<ITeam>> {
    if (!dto.name || dto.name.trim() === '') {
      return {
        success: false,
        error: 'Takım adı boş olamaz',
      };
    }

    const teamData = {
      name: dto.name,
      description: dto.description,
      ownerId,
      memberCount: 1,
      isActive: true,
      members: [ownerId], // Owner otomatik olarak members array'ine eklenir
      taskIds: [],
      noteIds: [],
      todoIds: [],
      chatbotRules: [...DEFAULT_CHATBOT_RULES], // Default chatbot kurallarını kopyala
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Takım oluştur
    const teamResult = await this.teamRepository.create(teamData);
    if (!teamResult.success || !teamResult.data) {
      this.logger.error('Takım oluşturma hatası', { error: teamResult.error });
      return teamResult;
    }

    const team = teamResult.data;
    this.logger.info('Takım oluşturuldu', { teamId: team.id });

    // Takım kurulumunu yap
    const setupSuccess = await this.teamSetupService.setupTeam(team.id, ownerId);
    if (!setupSuccess) {
      // Hata durumunda takımı sil
      await this.teamRepository.delete(team.id);
      return {
        success: false,
        error: 'Takım kurulumu başarısız',
      };
    }

    return teamResult;
  }

  // Get Team By Id
  public async getTeamById(id: string): Promise<IQueryResult<ITeam>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz takım ID',
      };
    }
    return this.teamRepository.getById(id);
  }

  // Get All Teams
  public async getAllTeams(): Promise<IListQueryResult<ITeam>> {
    return this.teamRepository.getAll();
  }

  // Update Team
  public async updateTeam(id: string, dto: IUpdateTeamDto): Promise<IQueryResult<ITeam>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz takım ID',
      };
    }

    const exists = await this.teamRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        error: 'Takım bulunamadı',
      };
    }

    return this.teamRepository.update(id, dto);
  }

  // Delete Team - Sadece owner silebilir
  public async deleteTeam(id: string, userId: string): Promise<IQueryResult<boolean>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        data: false,
        error: 'Geçersiz takım ID',
      };
    }

    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: false,
        error: 'Geçersiz kullanıcı ID',
      };
    }

    // Takımı getir
    const teamResult = await this.teamRepository.getById(id);
    if (!teamResult.success || !teamResult.data) {
      return {
        success: false,
        data: false,
        error: 'Takım bulunamadı',
      };
    }

    const team = teamResult.data;

    // Sadece owner silebilir
    if (team.ownerId !== userId) {
      return {
        success: false,
        data: false,
        error: 'Sadece takım sahibi takımı silebilir',
      };
    }

    // Takımı sil (subcollection'lar Firestore'da otomatik silinmez ama 
    // parent document silindiğinde erişilemez hale gelir)
    // Not: Subcollection'ları manuel silmek için Cloud Functions kullanılabilir
    const deleteResult = await this.teamRepository.delete(id);
    
    if (deleteResult.success) {
      this.logger.info('Takım silindi', { teamId: id, deletedBy: userId });
    }

    return deleteResult;
  }

  // Get User Teams
  public async getUserTeams(userId: string): Promise<IListQueryResult<ITeam>> {
    if (!userId || userId.trim() === '') {
      return {
        success: false,
        data: [],
        error: 'Geçersiz kullanıcı ID',
        total: 0,
      };
    }
    // Firestore tarafında 'array-contains' ile filtrele (çok daha hızlı)
    const result = await this.teamRepository.getByFilter([
      { field: 'members', operator: 'array-contains', value: userId },
    ]);
    return result;
  }

  // Join Team
  public async joinTeam(teamId: string, userId: string): Promise<IQueryResult<ITeam>> {
    try {
      this.logger.info('TeamService.joinTeam çağrıldı', { teamId, userId });

      if (!teamId || !userId) {
        return {
          success: false,
          error: 'Geçersiz takım veya kullanıcı ID',
        };
      }

      // Takımı getir
      this.logger.info('Takım getiriliyor', { teamId });
      const teamResult = await this.teamRepository.getById(teamId);

      if (!teamResult.success) {
        this.logger.error('Takım getirme hatası', { teamId, error: teamResult.error });
        return {
          success: false,
          error: `Takım bulunamadı. Girdiğiniz ID doğru mu? (${teamId})`,
        };
      }

      if (!teamResult.data) {
        return {
          success: false,
          error: 'Takım verisi alınamadı',
        };
      }

      const team = teamResult.data;
      this.logger.info('Takım bulundu', { teamId, teamName: team.name });

      // Zaten üye mi kontrol et
      if (team.members.includes(userId)) {
        return {
          success: false,
          error: 'Zaten bu takımın üyesisiniz',
        };
      }

      // ÖNCE: Kullanıcıyı members array'ine ekle (Firebase Rules için gerekli)
      // Böylece isTeamMember() true döner ve roller oluşturulabilir
      this.logger.info('Kullanıcı önce members array\'ine ekleniyor (roller oluşturma için)', { teamId, userId });
      const tempUpdatedMembers = [...team.members, userId];
      const tempUpdateResult = await this.teamRepository.update(teamId, {
        members: tempUpdatedMembers,
      });

      if (!tempUpdateResult.success) {
        this.logger.error('Kullanıcı members array\'ine eklenemedi', {
          teamId,
          userId,
          error: tempUpdateResult.error,
        });
        return {
          success: false,
          error: 'Takıma katılamadı: ' + tempUpdateResult.error,
        };
      }

      this.logger.info('Kullanıcı members array\'ine eklendi', { teamId, userId });

      // Kullanıcının Firestore'da kaydı var mı kontrol et, yoksa oluştur
      try {
        const { getUserService } = await import('../di/container');
        const userService = getUserService();
        const existingUserResult = await userService.getUserById(userId);
        
        if (!existingUserResult.success || !existingUserResult.data) {
          // Kullanıcı Firestore'da yok, oluştur
          this.logger.info('Kullanıcı Firestore\'da bulunamadı, oluşturuluyor', { userId });
          const { getAuth } = await import('firebase/auth');
          const auth = getAuth();
          const currentUser = auth.currentUser;
          
          if (currentUser && currentUser.uid === userId) {
            await userService.createOrUpdateUserFromAuth(
              userId,
              currentUser.email || '',
              currentUser.displayName || undefined
            );
            this.logger.info('Kullanıcı Firestore\'a kaydedildi', { userId });
          }
        }
      } catch (error) {
        this.logger.warn('Kullanıcı Firestore kaydı kontrol edilemedi', { userId, error });
        // Hata olsa bile devam et
      }

      // ŞİMDİ: Member rolünü getir veya oluştur (katılanlar otomatik Member rolüne atanır)
      this.logger.info('Member rolü getiriliyor', { teamId });
      let memberRoleResult = await this.roleService.getMemberRole(teamId);

      // Member rolü yoksa oluştur
      if (!memberRoleResult.success || !memberRoleResult.data) {
        this.logger.info('Member rolü bulunamadı, oluşturuluyor', { teamId });

        // Varsayılan rolleri oluştur (artık kullanıcı members array'inde, isTeamMember() true döner)
        const createRolesResult = await this.roleService.createDefaultRoles(teamId);
        
        if (!createRolesResult.success) {
          // Hata durumunda members array'inden geri al
          this.logger.error('Varsayılan roller oluşturulamadı, geri alınıyor', { 
            teamId, 
            error: createRolesResult.error 
          });
          await this.teamRepository.update(teamId, {
            members: team.members,
          });
          return {
            success: false,
            error: createRolesResult.error || 'Takım rolleri oluşturulamadı. Lütfen tekrar deneyin.',
          };
        }

        // Tekrar dene
        memberRoleResult = await this.roleService.getMemberRole(teamId);

        if (!memberRoleResult.success || !memberRoleResult.data) {
          // Hata durumunda members array'inden geri al
          this.logger.error('Member rolü oluşturulduktan sonra bulunamadı, geri alınıyor', { teamId });
          await this.teamRepository.update(teamId, {
            members: team.members,
          });
          return {
            success: false,
            error: 'Takım rolleri oluşturuldu ancak Member rolü bulunamadı. Lütfen tekrar deneyin.',
          };
        }

        this.logger.info('Member rolü başarıyla oluşturuldu', { teamId });
      }

      this.logger.info('Member rolü bulundu', { teamId, roleId: memberRoleResult.data.id });

      // Üyeyi otomatik olarak Member rolüyle subcollection'a ekle
      const now = new Date();
      this.logger.info('Üye otomatik olarak Member rolüyle ekleniyor', { teamId, userId });

      const memberCreateResult = await this.teamMemberRepository.create(teamId, {
        userId,
        roleId: memberRoleResult.data.id,
        addedBy: userId, // Kendisi katıldı
        addedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      if (!memberCreateResult.success) {
        // Hata durumunda members array'inden geri al
        this.logger.error('Üye eklenme hatası, geri alınıyor', {
          teamId,
          userId,
          error: memberCreateResult.error,
        });
        await this.teamRepository.update(teamId, {
          members: team.members,
        });
        return {
          success: false,
          error: 'Üye kaydı oluşturulamadı: ' + memberCreateResult.error,
        };
      }

      this.logger.info('Üye Member rolüyle subcollection\'a eklendi', { teamId, userId });

      // Team document'ine member count'u güncelle (members array zaten güncellendi)
      this.logger.info('Team document member count güncelleniyor', { teamId });
      const updatedTeam = await this.teamRepository.update(teamId, {
        memberCount: team.memberCount + 1,
      });

      if (updatedTeam.success) {
        this.logger.info('Takıma katılma başarılı! Member rolü otomatik atandı.', {
          teamId,
          userId,
        });
        
        // Cache'i temizle - yeni kullanıcı bilgileri için
        try {
          const { getTeamMemberInfoService } = await import('../di/container');
          const memberInfoService = getTeamMemberInfoService();
          memberInfoService.invalidateCache(teamId);
          this.logger.info('Cache temizlendi', { teamId });
        } catch (error) {
          this.logger.warn('Cache temizlenemedi', { teamId, error });
        }
      }

      return updatedTeam;
    } catch (error) {
      this.logger.error('joinTeam exception', { teamId, userId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      };
    }
  }

  // Leave Team - Owner da çıkabilir
  public async leaveTeam(teamId: string, userId: string): Promise<IQueryResult<ITeam>> {
    if (!teamId || !userId) {
      return {
        success: false,
        error: 'Geçersiz takım veya kullanıcı ID',
      };
    }

    const teamResult = await this.teamRepository.getById(teamId);
    if (!teamResult.success || !teamResult.data) {
      return {
        success: false,
        error: 'Takım bulunamadı',
      };
    }

    const team = teamResult.data;

    // Üye mi kontrol et
    if (!team.members.includes(userId)) {
      return {
        success: false,
        error: 'Takım üyesi değilsiniz',
      };
    }

    // Üyeliği subcollection'dan getir ve sil
    const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);
    if (memberResult.success && memberResult.data.length > 0) {
      const member = memberResult.data[0];
      await this.teamMemberRepository.delete(teamId, member.id);
    }

    // Team document'ten members array'den çıkar ve member count'u azalt
    const updatedMembers = team.members.filter((id) => id !== userId);
    const updatedTeam = await this.teamRepository.update(teamId, {
      members: updatedMembers,
      memberCount: Math.max(0, team.memberCount - 1),
    });

    if (updatedTeam.success) {
      this.logger.info('Kullanıcı takımdan ayrıldı', { teamId, userId, isOwner: team.ownerId === userId });
    }

    return updatedTeam;
  }

  // Get Team Members
  public async getTeamMembers(teamId: string): Promise<string[]> {
    const teamResult = await this.teamRepository.getById(teamId);
    if (!teamResult.success || !teamResult.data) {
      return [];
    }
    return teamResult.data.members;
  }

  // Assign User Role - Kullanıcıyı belirli bir role ata
  public async assignUserRole(
    teamId: string,
    userId: string,
    roleId: string,
    assignedBy: string
  ): Promise<IQueryResult<boolean>> {
    try {
      // Takım var mı kontrol et
      const teamResult = await this.teamRepository.getById(teamId);
      if (!teamResult.success || !teamResult.data) {
        return {
          success: false,
          data: false,
          error: 'Takım bulunamadı',
        };
      }

      // Kullanıcı takım üyesi mi kontrol et
      if (!teamResult.data.members.includes(userId)) {
        return {
          success: false,
          data: false,
          error: 'Kullanıcı bu takımın üyesi değil',
        };
      }

      // Rol var mı kontrol et
      const roleResult = await this.roleService.getRoleById(teamId, roleId);
      if (!roleResult.success || !roleResult.data) {
        return {
          success: false,
          data: false,
          error: 'Rol bulunamadı',
        };
      }

      // Kullanıcının mevcut üyeliğini getir
      const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);
      
      if (!memberResult.success || memberResult.data.length === 0) {
        // Üyelik yoksa yeni oluştur
        const now = new Date();
        await this.teamMemberRepository.create(teamId, {
          userId,
          roleId,
          addedBy: assignedBy,
          addedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // Üyelik varsa role güncelle
        const member = memberResult.data[0];
        await this.teamMemberRepository.update(teamId, member.id, {
          roleId,
        });
      }

      this.logger.info('Kullanıcı role atandı', { teamId, userId, roleId });
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      this.logger.error('assignUserRole exception', { teamId, userId, roleId, error });
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Rol ataması başarısız',
      };
    }
  }

  // Get User Role - Kullanıcının takımdaki rolünü getir
  public async getUserRole(teamId: string, userId: string): Promise<IQueryResult<string>> {
    try {
      const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);
      
      if (!memberResult.success || memberResult.data.length === 0) {
        return {
          success: false,
          error: 'Kullanıcı bu takımda değil',
        };
      }

      const member = memberResult.data[0];
      return {
        success: true,
        data: member.roleId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rol getirilemedi',
      };
    }
  }

  // Remove Member - Kullanıcıyı takımdan çıkar
  public async removeMember(
    teamId: string,
    userId: string,
    removedBy: string
  ): Promise<IQueryResult<boolean>> {
    try {
      this.logger.info('Kullanıcı takımdan çıkarılıyor', { teamId, userId, removedBy });

      // Takımı getir
      const teamResult = await this.teamRepository.getById(teamId);
      if (!teamResult.success || !teamResult.data) {
        return {
          success: false,
          data: false,
          error: 'Takım bulunamadı',
        };
      }

      const team = teamResult.data;

      // Owner kendini çıkaramaz
      if (team.ownerId === userId) {
        return {
          success: false,
          data: false,
          error: 'Takım sahibi takımdan çıkarılamaz',
        };
      }

      // Kullanıcı üye mi kontrol et
      if (!team.members.includes(userId)) {
        return {
          success: false,
          data: false,
          error: 'Kullanıcı bu takımın üyesi değil',
        };
      }

      // Üyeliği subcollection'dan sil
      const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, userId);
      if (memberResult.success && memberResult.data.length > 0) {
        const member = memberResult.data[0];
        await this.teamMemberRepository.delete(teamId, member.id);
      }

      // Team document'ten members array'den çıkar
      const updatedMembers = team.members.filter((id) => id !== userId);
      await this.teamRepository.update(teamId, {
        members: updatedMembers,
        memberCount: Math.max(0, team.memberCount - 1),
      });

      this.logger.info('Kullanıcı takımdan çıkarıldı', { teamId, userId });
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      this.logger.error('removeMember exception', { teamId, userId, removedBy, error });
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Üye çıkarılamadı',
      };
    }
  }
}

