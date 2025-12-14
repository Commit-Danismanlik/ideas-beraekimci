import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { SubcollectionRepository } from './SubcollectionRepository';
import { IRole, Permission } from '../models/Role.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class RoleRepository extends SubcollectionRepository<IRole> {
  constructor(firestore: Firestore) {
    super('teams', 'roles', firestore);
  }

  protected toFirestore(data: Partial<IRole>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.name !== undefined) firestoreData.name = data.name;
    if (data.permissions !== undefined) firestoreData.permissions = data.permissions;
    if (data.isCustom !== undefined) firestoreData.isCustom = data.isCustom;
    if (data.isDefault !== undefined) firestoreData.isDefault = data.isDefault;
    if (data.color !== undefined) firestoreData.color = data.color;
    if (data.isDeleted !== undefined) firestoreData.isDeleted = data.isDeleted;
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): IRole {
    return {
      id: data.id as string,
      name: data.name as string,
      permissions: (data.permissions as string[]) as Permission[],
      isCustom: data.isCustom as boolean,
      isDefault: data.isDefault as boolean,
      color: data.color as string | undefined,
      isDeleted: data.isDeleted as boolean | undefined,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Varsayılan rolleri getir
  public async getDefaultRoles(teamId: string): Promise<IListQueryResult<IRole>> {
    const filters: IFilter[] = [
      {
        field: 'isDefault',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Custom rolleri getir
  public async getCustomRoles(teamId: string): Promise<IListQueryResult<IRole>> {
    const filters: IFilter[] = [
      {
        field: 'isCustom',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(teamId, filters);
  }
}

