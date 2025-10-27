import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import { RoleRepository } from '../repositories/RoleRepository';

export interface IMemberWithRole {
  userId: string;
  email: string;
  displayName?: string;
  birthDate?: Date;
  roleId: string;
  roleName: string;
}

export class TeamMemberInfoService {
  private teamMemberRepository: TeamMemberRepository;
  private roleRepository: RoleRepository;
  private db: Firestore;

  constructor(
    teamMemberRepository: TeamMemberRepository,
    roleRepository: RoleRepository,
    firestore: Firestore
  ) {
    this.teamMemberRepository = teamMemberRepository;
    this.roleRepository = roleRepository;
    this.db = firestore;
  }

  // Takım üyelerinin detaylı bilgilerini getir
  public async getMembersWithInfo(teamId: string, memberIds: string[]): Promise<IMemberWithRole[]> {
    const membersData: IMemberWithRole[] = [];
    const auth = getAuth();

    for (const memberId of memberIds) {
      try {
        // Email bilgisini al
        let email = memberId;
        let displayName: string | undefined = undefined;
        let birthDate: Date | undefined = undefined;

        // Mevcut kullanıcı mı?
        if (auth.currentUser?.uid === memberId) {
          email = auth.currentUser.email || memberId;
          displayName = auth.currentUser.displayName || undefined;
        } else {
          // Önce Firestore users collection'dan dene
          try {
            const userDoc = await getDoc(doc(this.db, 'users', memberId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              email = userData.email || memberId;
              displayName = userData.name || userData.displayName;
              if (userData.birthDate) {
                birthDate = userData.birthDate.toDate();
              }
              console.log(`Firestore'dan kullanıcı bilgisi alındı: ${displayName} (${email})`);
            } else {
              console.log(`Firestore users collection'da bulunamadı: ${memberId}`);
              // Firestore'da yoksa, email'in sonuna @email.com ekleme yerine ID'yi kullan
              // Çünkü gerçek email bilgisini Firebase Authentication'dan alamıyoruz
              email = `${memberId}@example.com`; // Geçici placeholder
              displayName = memberId.substring(0, 8); // İlk 8 karakteri göster
            }
          } catch (error) {
            console.error('Users collection hatası:', memberId, error);
            // Hata durumunda placeholder kullan
            email = `${memberId}@example.com`;
            displayName = memberId.substring(0, 8);
          }
        }

        // Kullanıcının rolünü getir
        const memberResult = await this.teamMemberRepository.getMemberByUserId(teamId, memberId);
        let roleId = '';
        let roleName = 'Member';

        if (memberResult.success && memberResult.data.length > 0) {
          const member = memberResult.data[0];
          roleId = member.roleId;
          
          // Rol adını getir
          const roleResult = await this.roleRepository.getById(teamId, member.roleId);
          if (roleResult.success && roleResult.data) {
            roleName = roleResult.data.name;
          }
        }

        membersData.push({
          userId: memberId,
          email,
          displayName,
          birthDate,
          roleId,
          roleName,
        });
      } catch (error) {
        console.error('Üye bilgisi alınamadı:', memberId, error);
      }
    }

    return membersData;
  }
}

