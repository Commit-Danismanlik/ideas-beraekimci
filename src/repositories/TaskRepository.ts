import { DocumentData, Firestore, Timestamp, collection, query, orderBy, limit as fbLimit, getDocs, where } from 'firebase/firestore';
import { SubcollectionRepository } from './SubcollectionRepository';
import { ITask } from '../models/Task.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class TaskRepository extends SubcollectionRepository<ITask> {
  constructor(firestore: Firestore) {
    super('teams', 'tasks', firestore);
  }

  protected toFirestore(data: Partial<ITask>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.title !== undefined) firestoreData.title = data.title;
    if (data.description !== undefined) firestoreData.description = data.description;
    if (data.assignedTo !== undefined) firestoreData.assignedTo = data.assignedTo;
    if (data.status !== undefined) firestoreData.status = data.status;
    if (data.priority !== undefined) firestoreData.priority = data.priority;
    if (data.finishedAt !== undefined) {
      firestoreData.finishedAt = Timestamp.fromDate(data.finishedAt);
    }
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): ITask {
    return {
      id: data.id as string,
      title: data.title as string,
      description: data.description as string | undefined,
      assignedTo: data.assignedTo as string | undefined,
      status: data.status as 'todo' | 'in-progress' | 'done',
      priority: data.priority as 'low' | 'medium' | 'high',
      finishedAt: data.finishedAt ? (data.finishedAt as Timestamp).toDate() : undefined,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Kullanıcıya atanmış taskları getir
  public async getTasksByAssignee(teamId: string, userId: string): Promise<IListQueryResult<ITask>> {
    const filters: IFilter[] = [
      {
        field: 'assignedTo',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Status'a göre taskları getir
  public async getTasksByStatus(
    teamId: string,
    status: 'todo' | 'in-progress' | 'done'
  ): Promise<IListQueryResult<ITask>> {
    const filters: IFilter[] = [
      {
        field: 'status',
        operator: '==',
        value: status,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Son oluşturulan görevleri getir (createdAt desc, limit)
  public async getRecent(teamId: string, take: number): Promise<IListQueryResult<ITask>> {
    try {
      const subRef = collection(this.db, 'teams', teamId, 'tasks');
      const q = query(subRef, orderBy('createdAt', 'desc'), fbLimit(take));
      const snap = await getDocs(q);
      const data: ITask[] = [];
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

  // Belirli bir tarihten önceki görevleri getir (createdAt < before, desc, limit)
  public async getRecentBefore(teamId: string, before: Date, take: number): Promise<IListQueryResult<ITask>> {
    try {
      const subRef = collection(this.db, 'teams', teamId, 'tasks');
      const q = query(subRef, where('createdAt', '<', Timestamp.fromDate(before)), orderBy('createdAt', 'desc'), fbLimit(take));
      const snap = await getDocs(q);
      const data: ITask[] = [];
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

  // Priority'ye göre taskları getir
  public async getTasksByPriority(
    teamId: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<IListQueryResult<ITask>> {
    const filters: IFilter[] = [
      {
        field: 'priority',
        operator: '==',
        value: priority,
      },
    ];
    return this.getByFilter(teamId, filters);
  }
}

