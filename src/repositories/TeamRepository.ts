import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { ITeam } from '../models/Team.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class TeamRepository extends BaseRepository<ITeam> {
  constructor(firestore: Firestore) {
    super('teams', firestore);
  }

  protected toFirestore(data: Partial<ITeam>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.name !== undefined) firestoreData.name = data.name;
    if (data.description !== undefined) firestoreData.description = data.description;
    if (data.ownerId !== undefined) firestoreData.ownerId = data.ownerId;
    if (data.memberCount !== undefined) firestoreData.memberCount = data.memberCount;
    if (data.isActive !== undefined) firestoreData.isActive = data.isActive;
    if (data.members !== undefined) firestoreData.members = data.members;
    if (data.taskIds !== undefined) firestoreData.taskIds = data.taskIds;
    if (data.noteIds !== undefined) firestoreData.noteIds = data.noteIds;
    if (data.todoIds !== undefined) firestoreData.todoIds = data.todoIds;
    if (data.chatbotRules !== undefined) firestoreData.chatbotRules = data.chatbotRules;
    if (data.geminiApiKey !== undefined) firestoreData.geminiApiKey = data.geminiApiKey;
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): ITeam {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string | undefined,
      ownerId: data.ownerId as string,
      memberCount: (data.memberCount as number) || 0,
      isActive: data.isActive as boolean,
      members: (data.members as string[]) || [],
      taskIds: (data.taskIds as string[]) || [],
      noteIds: (data.noteIds as string[]) || [],
      todoIds: (data.todoIds as string[]) || [],
      chatbotRules: (data.chatbotRules as string[] | undefined),
      geminiApiKey: (data.geminiApiKey as string | undefined),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Owner'a göre takımları getir
  public async getTeamsByOwner(ownerId: string): Promise<IListQueryResult<ITeam>> {
    const filters: IFilter[] = [
      {
        field: 'ownerId',
        operator: '==',
        value: ownerId,
      },
    ];
    return this.getByFilter(filters);
  }

  // Owner ID'ye göre takımları getir
  public async getTeamsByOwnerId(ownerId: string): Promise<IListQueryResult<ITeam>> {
    const filters: IFilter[] = [
      {
        field: 'ownerId',
        operator: '==',
        value: ownerId,
      },
    ];
    return this.getByFilter(filters);
  }

  // Aktif takımları getir
  public async getActiveTeams(): Promise<IListQueryResult<ITeam>> {
    const filters: IFilter[] = [
      {
        field: 'isActive',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(filters);
  }
}

