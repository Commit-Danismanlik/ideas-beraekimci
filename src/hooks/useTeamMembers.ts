import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../config/firebase.config';

export interface IUserInfo {
  uid: string;
  email: string;
  displayName?: string;
}

export interface IMemberWithInfo {
  userId: string;
  email: string;
  displayName?: string;
  roleId: string;
  roleName: string;
}

export const useTeamMembers = (teamId: string | null, members: string[], roles: { id: string; name: string }[]) => {
  const [membersWithInfo, setMembersWithInfo] = useState<IMemberWithInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (!teamId || members.length === 0) {
        setMembersWithInfo([]);
        return;
      }

      setLoading(true);
      const auth = getAuth();
      const db = getFirestoreDb();
      const membersData: IMemberWithInfo[] = [];

      for (const memberId of members) {
        try {
          // Firebase Auth'dan kullanıcı bilgisi al
          const authUser = auth.currentUser?.uid === memberId ? auth.currentUser : null;
          
          let email = 'Bilinmiyor';
          let displayName = undefined;

          if (authUser) {
            email = authUser.email || 'Bilinmiyor';
            displayName = authUser.displayName || undefined;
          } else {
            // Firestore'dan kullanıcı bilgisini al (eğer users collection'ı varsa)
            try {
              const userDoc = await getDoc(doc(db, 'users', memberId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                email = userData.email || memberId;
                displayName = userData.name || userData.displayName;
              } else {
                email = memberId; // ID'yi göster
              }
            } catch {
              email = memberId;
            }
          }

          // Kullanıcının rolünü bul
          // members subcollection'dan almak gerekir
          let roleName = 'Member';
          let roleId = '';
          
          // Basitleştirilmiş versiyon - default Member
          const memberRole = roles.find(r => r.name === 'Member');
          if (memberRole) {
            roleId = memberRole.id;
            roleName = memberRole.name;
          }

          membersData.push({
            userId: memberId,
            email,
            displayName,
            roleId,
            roleName,
          });
        } catch (error) {
          console.error('Üye bilgisi alınamadı:', memberId, error);
        }
      }

      setMembersWithInfo(membersData);
      setLoading(false);
    };

    fetchMemberInfo();
  }, [teamId, members, roles]);

  return { membersWithInfo, loading };
};

