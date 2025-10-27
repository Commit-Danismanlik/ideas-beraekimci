import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
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
}

