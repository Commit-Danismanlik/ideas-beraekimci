import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import { IRoleService } from '../interfaces/IRoleService';
import { IUserService } from '../interfaces/IUserService';

export interface IMemberWithRole {
  userId: string;
  email: string;
  displayName?: string;
  birthDate?: Date;
  roleId: string;
  roleName: string;
}

interface UserInfo {
  email: string;
  displayName?: string;
  birthDate?: Date;
}

interface MemberInfo {
  roleId: string;
}

interface RoleInfo {
  name: string;
}

export class TeamMemberInfoService {
  private teamMemberRepository: TeamMemberRepository;
  private roleService: IRoleService;
  private userService: IUserService;
  private db: Firestore;
  private cache = new Map<string, { data: IMemberWithRole[]; timestamp: number }>();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 dakika

  constructor(
    teamMemberRepository: TeamMemberRepository,
    roleService: IRoleService,
    userService: IUserService,
    firestore: Firestore
  ) {
    this.teamMemberRepository = teamMemberRepository;
    this.roleService = roleService;
    this.userService = userService;
    this.db = firestore;
  }

  // ✅ OPTİMİZE EDİLMİŞ: Batch query ile tüm verileri tek seferde çek
  public async getMembersWithInfo(teamId: string, memberIds: string[]): Promise<IMemberWithRole[]> {
    if (!memberIds || memberIds.length === 0) {
      return [];
    }

    // Cache kontrolü
    const cacheKey = `${teamId}:${memberIds.sort().join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

    try {
      // 1. TÜM KULLANICILARI TEK SEFERDE ÇEK (Batch)
      const usersMap = await this.getUsersBatch(memberIds, currentUserId);

      // 2. TÜM MEMBER'LARI TEK SEFERDE ÇEK
      const membersMap = await this.getMembersBatch(teamId, memberIds);

      // 3. TÜM ROLLERİ TEK SEFERDE ÇEK
      const rolesMap = await this.getRolesBatch(teamId, membersMap);

      // 4. VERİLERİ BİRLEŞTİR
      const membersData: IMemberWithRole[] = memberIds.map((memberId) => {
        const userInfo = usersMap.get(memberId);
        const memberInfo = membersMap.get(memberId);
        const roleInfo = rolesMap.get(memberInfo?.roleId || '');

        return {
          userId: memberId,
          email: userInfo?.email || memberId,
          displayName: userInfo?.displayName,
          birthDate: userInfo?.birthDate,
          roleId: memberInfo?.roleId || '',
          roleName: roleInfo?.name || 'Member',
        };
      });

      // Cache'e kaydet
      this.cache.set(cacheKey, { data: membersData, timestamp: Date.now() });

      return membersData;
    } catch (error) {
      console.error('Üye bilgileri alınamadı:', error);
      return [];
    }
  }

  // Tüm kullanıcıları tek query ile çek (paralel batch)
  private async getUsersBatch(
    memberIds: string[],
    currentUserId: string | undefined
  ): Promise<Map<string, UserInfo>> {
    const usersMap = new Map<string, UserInfo>();
    const auth = getAuth();

    // Mevcut kullanıcıyı direkt ekle
    if (currentUserId && memberIds.includes(currentUserId)) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        usersMap.set(currentUserId, {
          email: currentUser.email || currentUserId,
          displayName: currentUser.displayName || undefined,
        });
      }
    }

    // Diğer kullanıcılar için batch query
    const otherUserIds = memberIds.filter((id) => id !== currentUserId);
    if (otherUserIds.length === 0) {
      return usersMap;
    }

    // Firestore'da her kullanıcı için paralel query (getDoc paralel çalışır)
    // 10'dan fazla varsa chunk'lara böl (Firestore limit'i yok ama performans için)
    const chunks: string[][] = [];
    for (let i = 0; i < otherUserIds.length; i += 10) {
      chunks.push(otherUserIds.slice(i, i + 10));
    }

    // Her chunk için paralel query
    const userPromises = chunks.map(async (chunk) => {
      const userDocs = await Promise.all(
        chunk.map((userId) => getDoc(doc(this.db, 'users', userId)))
      );

      // Firestore'dan bulunamayan kullanıcılar için UserService'den tekrar dene
      const missingUserIds: string[] = [];

      userDocs.forEach((userDoc, index) => {
        const userId = chunk[index];
        if (userDoc.exists()) {
          const userData = userDoc.data();
          usersMap.set(userId, {
            email: userData.email || userId,
            displayName: userData.name || userData.displayName,
            birthDate: userData.birthDate?.toDate(),
          });
        } else {
          missingUserIds.push(userId);
        }
      });

      // Firestore'da bulunamayan kullanıcılar için UserService'den tekrar dene
      for (const userId of missingUserIds) {
        try {
          const userResult = await this.userService.getUserById(userId);
          if (userResult.success && userResult.data) {
            usersMap.set(userId, {
              email: userResult.data.email,
              displayName: userResult.data.name,
              birthDate: userResult.data.birthDate,
            });
          } else {
            // Hala bulunamadıysa, Firebase Auth'dan bilgi çekmeyi dene (sadece current user için)
            const auth = getAuth();
            if (auth.currentUser && auth.currentUser.uid === userId) {
              usersMap.set(userId, {
                email: auth.currentUser.email || userId,
                displayName: auth.currentUser.displayName || undefined,
              });
            } else {
              // Başka kullanıcılar için userId'yi göster (şifrelenmiş ID)
              // Ancak bu durumda kullanıcı bilgilerinin Firestore'da olması gerekiyor
              console.warn(`Kullanıcı bilgisi Firestore'da bulunamadı: ${userId}. Lütfen kullanıcının Firestore'da kaydının olduğundan emin olun.`);
              usersMap.set(userId, {
                email: userId, // Geçici olarak userId'yi göster
                displayName: undefined,
              });
            }
          }
        } catch (error) {
          console.error(`Kullanıcı bilgisi alınamadı: ${userId}`, error);
          // Son çare olarak userId'yi göster
          usersMap.set(userId, {
            email: userId,
            displayName: undefined,
          });
        }
      }
    });

    await Promise.all(userPromises);
    return usersMap;
  }

  // ✅ Tüm member'ları tek query ile çek
  private async getMembersBatch(
    teamId: string,
    memberIds: string[]
  ): Promise<Map<string, MemberInfo>> {
    const membersMap = new Map<string, MemberInfo>();

    // TeamMemberRepository'den tüm member'ları tek seferde çek
    const allMembersResult = await this.teamMemberRepository.getAll(teamId);
    
    if (allMembersResult.success) {
      // Sadece istenen member'ları filtrele
      allMembersResult.data
        .filter((member) => memberIds.includes(member.userId))
        .forEach((member) => {
          membersMap.set(member.userId, { roleId: member.roleId });
        });
    }

    return membersMap;
  }

  // ✅ Tüm rolleri tek query ile çek
  private async getRolesBatch(
    teamId: string,
    _membersMap: Map<string, MemberInfo>
  ): Promise<Map<string, RoleInfo>> {
    const rolesMap = new Map<string, RoleInfo>();

    // Tüm rolleri tek seferde çek
    const allRolesResult = await this.roleService.getTeamRoles(teamId);
    
    if (allRolesResult.success) {
      allRolesResult.data.forEach((role) => {
        rolesMap.set(role.id, { name: role.name });
      });
    }

    return rolesMap;
  }

  // Cache'i temizle
  public invalidateCache(teamId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(teamId)) {
        this.cache.delete(key);
      }
    }
  }
}

