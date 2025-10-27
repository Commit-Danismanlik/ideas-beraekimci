import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { IUser } from '../models/User.model';
import { IFilter, IListQueryResult } from '../types/base.types';

// SOLID: Single Responsibility Principle - Sadece User CRUD operasyonlarından sorumlu
export class UserRepository extends BaseRepository<IUser> {
  constructor(firestore: Firestore) {
    super('users', firestore);
  }

  // Firestore'a veri dönüşümü
  protected toFirestore(data: Partial<IUser>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.name !== undefined) firestoreData.name = data.name;
    if (data.email !== undefined) firestoreData.email = data.email;
    if (data.age !== undefined) firestoreData.age = data.age;
    if (data.birthDate !== undefined && data.birthDate !== null) {
      firestoreData.birthDate = Timestamp.fromDate(data.birthDate);
    }
    if (data.isActive !== undefined) firestoreData.isActive = data.isActive;
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  // Firestore'dan veri dönüşümü
  protected fromFirestore(data: DocumentData): IUser {
    return {
      id: data.id as string,
      name: data.name as string,
      email: data.email as string,
      age: data.age as number | undefined,
      birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
      isActive: data.isActive as boolean,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Custom query metodları - Her query için ayrı metod

  // Email'e göre kullanıcı getir
  public async getByEmail(email: string): Promise<IListQueryResult<IUser>> {
    const filters: IFilter[] = [
      {
        field: 'email',
        operator: '==',
        value: email,
      },
    ];
    return this.getByFilter(filters);
  }

  // Aktif kullanıcıları getir
  public async getActiveUsers(): Promise<IListQueryResult<IUser>> {
    const filters: IFilter[] = [
      {
        field: 'isActive',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(filters);
  }

  // Yaşa göre kullanıcıları getir
  public async getUsersByAgeRange(
    minAge: number,
    maxAge: number
  ): Promise<IListQueryResult<IUser>> {
    const filters: IFilter[] = [
      {
        field: 'age',
        operator: '>=',
        value: minAge,
      },
      {
        field: 'age',
        operator: '<=',
        value: maxAge,
      },
    ];
    return this.getByFilter(filters);
  }

  // İsme göre kullanıcıları ara (exact match)
  public async getUsersByName(name: string): Promise<IListQueryResult<IUser>> {
    const filters: IFilter[] = [
      {
        field: 'name',
        operator: '==',
        value: name,
      },
    ];
    return this.getByFilter(filters);
  }

  // Aktif kullanıcı sayısını getir
  public async countActiveUsers(): Promise<number> {
    const filters: IFilter[] = [
      {
        field: 'isActive',
        operator: '==',
        value: true,
      },
    ];
    return this.countByFilter(filters);
  }
}

