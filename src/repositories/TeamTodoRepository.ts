import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { SubcollectionRepository } from './SubcollectionRepository';
import { ITeamTodo } from '../models/TeamRepository.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class TeamTodoRepository extends SubcollectionRepository<ITeamTodo> {
  constructor(firestore: Firestore) {
    super('teams', 'todos', firestore);
  }

  protected toFirestore(data: Partial<ITeamTodo>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.createdBy !== undefined) firestoreData.createdBy = data.createdBy;
    if (data.assignedTo !== undefined) firestoreData.assignedTo = data.assignedTo;
    if (data.title !== undefined) firestoreData.title = data.title;
    if (data.description !== undefined) firestoreData.description = data.description;
    if (data.completed !== undefined) firestoreData.completed = data.completed;
    if (data.priority !== undefined) firestoreData.priority = data.priority;
    if (data.dueDate !== undefined) {
      firestoreData.dueDate = Timestamp.fromDate(data.dueDate);
    }
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): ITeamTodo {
    return {
      id: data.id as string,
      createdBy: data.createdBy as string,
      assignedTo: data.assignedTo as string | undefined,
      title: data.title as string,
      description: data.description as string | undefined,
      completed: data.completed as boolean,
      priority: data.priority as 'low' | 'medium' | 'high',
      dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Atanmış todo'ları getir
  public async getTodosByAssignee(
    teamId: string,
    userId: string
  ): Promise<IListQueryResult<ITeamTodo>> {
    const filters: IFilter[] = [
      {
        field: 'assignedTo',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Tamamlanma durumuna göre todo'ları getir
  public async getTodosByCompleted(
    teamId: string,
    completed: boolean
  ): Promise<IListQueryResult<ITeamTodo>> {
    const filters: IFilter[] = [
      {
        field: 'completed',
        operator: '==',
        value: completed,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Priority'ye göre todo'ları getir
  public async getTodosByPriority(
    teamId: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<IListQueryResult<ITeamTodo>> {
    const filters: IFilter[] = [
      {
        field: 'priority',
        operator: '==',
        value: priority,
      },
    ];
    return this.getByFilter(teamId, filters);
  }

  // Oluşturan kişiye göre todo'ları getir
  public async getTodosByCreator(
    teamId: string,
    userId: string
  ): Promise<IListQueryResult<ITeamTodo>> {
    const filters: IFilter[] = [
      {
        field: 'createdBy',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(teamId, filters);
  }
}

