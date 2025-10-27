import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { IPersonalNote } from '../models/PersonalRepository.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class PersonalNoteRepository extends BaseRepository<IPersonalNote> {
  constructor(firestore: Firestore) {
    super('personalNotes', firestore);
  }

  protected toFirestore(data: Partial<IPersonalNote>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.userId !== undefined) firestoreData.userId = data.userId;
    if (data.title !== undefined) firestoreData.title = data.title;
    if (data.content !== undefined) firestoreData.content = data.content;
    if (data.category !== undefined) firestoreData.category = data.category;
    if (data.tags !== undefined) firestoreData.tags = data.tags;
    if (data.isPinned !== undefined) firestoreData.isPinned = data.isPinned;
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): IPersonalNote {
    return {
      id: data.id as string,
      userId: data.userId as string,
      title: data.title as string,
      content: data.content as string,
      category: data.category as string | undefined,
      tags: (data.tags as string[]) || [],
      isPinned: data.isPinned as boolean,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Kullanıcıya göre notları getir
  public async getNotesByUser(userId: string): Promise<IListQueryResult<IPersonalNote>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(filters);
  }

  // Pinlenmiş notları getir
  public async getPinnedNotes(userId: string): Promise<IListQueryResult<IPersonalNote>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'isPinned',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(filters);
  }

  // Kategoriye göre notları getir
  public async getNotesByCategory(
    userId: string,
    category: string
  ): Promise<IListQueryResult<IPersonalNote>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'category',
        operator: '==',
        value: category,
      },
    ];
    return this.getByFilter(filters);
  }
}

