import { DocumentData, Firestore, Timestamp, collection, query, orderBy, limit as fbLimit, getDocs, where } from 'firebase/firestore';
import { SubcollectionRepository } from './SubcollectionRepository';
import { ITeamNote } from '../models/TeamRepository.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class TeamNoteRepository extends SubcollectionRepository<ITeamNote> {
  constructor(firestore: Firestore) {
    super('teams', 'notes', firestore);
  }

  protected toFirestore(data: Partial<ITeamNote>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.createdBy !== undefined) firestoreData.createdBy = data.createdBy;
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

  protected fromFirestore(data: DocumentData): ITeamNote {
    return {
      id: data.id as string,
      createdBy: data.createdBy as string,
      title: data.title as string,
      content: data.content as string,
      category: data.category as string | undefined,
      tags: (data.tags as string[]) || [],
      isPinned: data.isPinned as boolean,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Pinlenmiş notları getir
  public async getPinnedNotes(teamId: string): Promise<IListQueryResult<ITeamNote>> {
    const filters: IFilter[] = [
      {
        field: 'isPinned',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Oluşturan kişiye göre notları getir
  public async getNotesByCreator(
    teamId: string,
    userId: string
  ): Promise<IListQueryResult<ITeamNote>> {
    const filters: IFilter[] = [
      {
        field: 'createdBy',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Kategoriye göre notları getir
  public async getNotesByCategory(
    teamId: string,
    category: string
  ): Promise<IListQueryResult<ITeamNote>> {
    const filters: IFilter[] = [
      {
        field: 'category',
        operator: '==',
        value: category,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Son oluşturulan notları getir (createdAt desc, limit)
  public async getRecent(teamId: string, take: number): Promise<IListQueryResult<ITeamNote>> {
    try {
      const subRef = collection(this.db, 'teams', teamId, 'notes');
      const q = query(subRef, orderBy('createdAt', 'desc'), fbLimit(take));
      const snap = await getDocs(q);
      const data: ITeamNote[] = [];
      snap.forEach((doc) => {
        data.push(
          this.fromFirestore({ id: doc.id, ...doc.data() })
        );
      });
      return { success: true, data, total: data.length };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Bilinmeyen hata', total: 0 };
    }
  }

  // Belirli bir tarihten önceki notları getir (createdAt < before, desc, limit)
  public async getRecentBefore(teamId: string, before: Date, take: number): Promise<IListQueryResult<ITeamNote>> {
    try {
      const subRef = collection(this.db, 'teams', teamId, 'notes');
      const q = query(subRef, where('createdAt', '<', Timestamp.fromDate(before)), orderBy('createdAt', 'desc'), fbLimit(take));
      const snap = await getDocs(q);
      const data: ITeamNote[] = [];
      snap.forEach((doc) => {
        data.push(
          this.fromFirestore({ id: doc.id, ...doc.data() })
        );
      });
      return { success: true, data, total: data.length };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Bilinmeyen hata', total: 0 };
    }
  }
}

