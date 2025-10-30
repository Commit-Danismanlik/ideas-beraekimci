import { ITeamService } from '../interfaces/ITeamService';
import { IRoleService } from '../interfaces/IRoleService';
import { TeamRepository } from '../repositories/TeamRepository';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import { ITeam, ICreateTeamDto, IUpdateTeamDto } from '../models/Team.model';
import { IQueryResult, IListQueryResult } from '../types/base.types';

export class TeamService implements ITeamService {
  private teamRepository: TeamRepository;
  private teamMemberRepository: TeamMemberRepository;
  private roleService: IRoleService;

  constructor(
    teamRepository: TeamRepository,
    teamMemberRepository: TeamMemberRepository,
    roleService: IRoleService
  ) {
    this.teamRepository = teamRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.roleService = roleService;
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Takım oluştur
    const teamResult = await this.teamRepository.create(teamData);
    if (!teamResult.success || !teamResult.data) {
      console.error('Takım oluşturma hatası:', teamResult.error);
      return teamResult;
    }

    const team = teamResult.data;
    console.log('Takım oluşturuldu:', team.id);

    try {
      // Varsayılan rolleri oluştur (Owner ve Member) - AWAIT ile bekle
      console.log('Varsayılan roller oluşturuluyor (Owner ve Member)...');
      await this.roleService.createDefaultRoles(team.id);
      console.log('Varsayılan roller oluşturuldu');

      // Owner rolünü getir
      console.log('Owner rolü getiriliyor...');
      const ownerRoleResult = await this.roleService.getOwnerRole(team.id);
      
      if (!ownerRoleResult.success || !ownerRoleResult.data) {
        console.error('Owner rolü bulunamadı:', ownerRoleResult.error);
        // Takımı sil çünkü setup tamamlanamadı
        await this.teamRepository.delete(team.id);
        return {
          success: false,
          error: 'Takım rolleri oluşturulamadı',
        };
      }

      console.log('Owner rolü bulundu:', ownerRoleResult.data.id);

      // Takım sahibini Owner rolüyle members subcollection'a ekle
      console.log('Takım sahibi Owner rolüyle ekleniyor...');
      const now = new Date();
      const memberResult = await this.teamMemberRepository.create(team.id, {
        userId: ownerId,
        roleId: ownerRoleResult.data.id,
        addedBy: ownerId,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      if (!memberResult.success) {
        console.error('Owner üye olarak eklenemedi:', memberResult.error);
        // Takımı sil
        await this.teamRepository.delete(team.id);
        return {
          success: false,
          error: 'Takım kurucusu üye olarak eklenemedi',
        };
      }

      console.log('Takım kurulumu tamamlandı! Owner rolü atandı.');
      return teamResult;
    } catch (error) {
      console.error('Takım kurulum exception:', error);
      // Hata durumunda takımı sil
      await this.teamRepository.delete(team.id);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Takım kurulumu başarısız',
      };
    }
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

  // Delete Team
  public async deleteTeam(id: string): Promise<IQueryResult<boolean>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        data: false,
        error: 'Geçersiz takım ID',
      };
    }

    const exists = await this.teamRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        data: false,
        error: 'Takım bulunamadı',
      };
    }

    return this.teamRepository.delete(id);
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
      console.log('TeamService.joinTeam çağrıldı:', { teamId, userId });

      if (!teamId || !userId) {
        return {
          success: false,
          error: 'Geçersiz takım veya kullanıcı ID',
        };
      }

      // Takımı getir
      console.log('Takım getiriliyor:', teamId);
      const teamResult = await this.teamRepository.getById(teamId);
      
      if (!teamResult.success) {
        console.error('Takım getirme hatası:', teamResult.error);
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
      console.log('Takım bulundu:', team.name);

      // Zaten üye mi kontrol et
      if (team.members.includes(userId)) {
        return {
          success: false,
          error: 'Zaten bu takımın üyesisiniz',
        };
      }

      // Member rolünü getir veya oluştur (katılanlar otomatik Member rolüne atanır)
      console.log('Member rolü getiriliyor...');
      let memberRoleResult = await this.roleService.getMemberRole(teamId);
      
      // Member rolü yoksa oluştur
      if (!memberRoleResult.success || !memberRoleResult.data) {
        console.log('Member rolü bulunamadı, oluşturuluyor...');
        
        // Varsayılan rolleri oluştur
        await this.roleService.createDefaultRoles(teamId);
        
        // Tekrar dene
        memberRoleResult = await this.roleService.getMemberRole(teamId);
        
        if (!memberRoleResult.success || !memberRoleResult.data) {
          console.error('Member rolü oluşturulamadı');
          return {
            success: false,
            error: 'Takım rolleri oluşturulamadı. Lütfen tekrar deneyin.',
          };
        }
        
        console.log('Member rolü başarıyla oluşturuldu');
      }

      console.log('Member rolü bulundu:', memberRoleResult.data.id);

      // Üyeyi otomatik olarak Member rolüyle subcollection'a ekle
      const now = new Date();
      console.log('Üye otomatik olarak Member rolüyle ekleniyor...');
      
      const memberCreateResult = await this.teamMemberRepository.create(teamId, {
        userId,
        roleId: memberRoleResult.data.id,
        addedBy: userId, // Kendisi katıldı
        addedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      if (!memberCreateResult.success) {
        console.error('Üye eklenme hatası:', memberCreateResult.error);
        return {
          success: false,
          error: 'Üye kaydı oluşturulamadı: ' + memberCreateResult.error,
        };
      }

      console.log('Üye Member rolüyle subcollection\'a eklendi');

      // Team document'ine members array ve member count'u güncelle
      console.log('Team document güncelleniyor...');
      const updatedMembers = [...team.members, userId];
      const updatedTeam = await this.teamRepository.update(teamId, {
        members: updatedMembers,
        memberCount: team.memberCount + 1,
      });

      if (updatedTeam.success) {
        console.log('Takıma katılma başarılı! Member rolü otomatik atandı.');
      }

      return updatedTeam;
    } catch (error) {
      console.error('joinTeam exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      };
    }
  }

  // Leave Team
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

    // Owner takımdan ayrılamaz
    if (team.ownerId === userId) {
      return {
        success: false,
        error: 'Takım sahibi takımdan ayrılamaz',
      };
    }

    // Üye mi kontrol et
    if (!team.members.includes(userId)) {
      return {
        success: false,
        error: 'Takım üyesi değilsiniz',
      };
    }

    // Üyeliği subcollection'dan getir
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

      console.log(`Kullanıcı ${userId} role ${roleId} atandı`);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('assignUserRole exception:', error);
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
      console.log(`Kullanıcı ${userId} takımdan çıkarılıyor (çıkaran: ${removedBy})`);
      
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

      console.log(`Kullanıcı ${userId} takımdan çıkarıldı`);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('removeMember exception:', error);
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Üye çıkarılamadı',
      };
    }
  }
}

