import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { SubcollectionRepository } from './SubcollectionRepository';
import { ITeamMember } from '../models/Role.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class TeamMemberRepository extends SubcollectionRepository<ITeamMember> {
  constructor(firestore: Firestore) {
    super('teams', 'members', firestore);
  }

  protected toFirestore(data: Partial<ITeamMember>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.userId !== undefined) firestoreData.userId = data.userId;
    if (data.roleId !== undefined) firestoreData.roleId = data.roleId;
    if (data.addedBy !== undefined) firestoreData.addedBy = data.addedBy;
    if (data.addedAt !== undefined) {
      firestoreData.addedAt = Timestamp.fromDate(data.addedAt);
    }
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): ITeamMember {
    return {
      id: data.id as string,
      userId: data.userId as string,
      roleId: data.roleId as string,
      addedBy: data.addedBy as string,
      addedAt: (data.addedAt as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Kullanıcının belirli takımdaki üyeliğini getir
  public async getMemberByUserId(
    teamId: string,
    userId: string
  ): Promise<IListQueryResult<ITeamMember>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Role göre üyeleri getir
  public async getMembersByRole(
    teamId: string,
    roleId: string
  ): Promise<IListQueryResult<ITeamMember>> {
    const filters: IFilter[] = [
      {
        field: 'roleId',
        operator: '==',
        value: roleId,
      },
    ];
    return this.getByFilter(teamId, filters);
  }
}

