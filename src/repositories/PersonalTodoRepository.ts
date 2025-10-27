import { DocumentData, Firestore, Timestamp } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { IPersonalTodo } from '../models/PersonalRepository.model';
import { IFilter, IListQueryResult } from '../types/base.types';

export class PersonalTodoRepository extends BaseRepository<IPersonalTodo> {
  constructor(firestore: Firestore) {
    super('personalTodos', firestore);
  }

  protected toFirestore(data: Partial<IPersonalTodo>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.userId !== undefined) firestoreData.userId = data.userId;
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

  protected fromFirestore(data: DocumentData): IPersonalTodo {
    return {
      id: data.id as string,
      userId: data.userId as string,
      title: data.title as string,
      description: data.description as string | undefined,
      completed: data.completed as boolean,
      priority: data.priority as 'low' | 'medium' | 'high',
      dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Kullanıcıya göre todo'ları getir
  public async getTodosByUser(userId: string): Promise<IListQueryResult<IPersonalTodo>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
    ];
    return this.getByFilter(filters);
  }

  // Tamamlanmamış todo'ları getir
  public async getActiveTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'completed',
        operator: '==',
        value: false,
      },
    ];
    return this.getByFilter(filters);
  }

  // Tamamlanmış todo'ları getir
  public async getCompletedTodos(userId: string): Promise<IListQueryResult<IPersonalTodo>> {
    const filters: IFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'completed',
        operator: '==',
        value: true,
      },
    ];
    return this.getByFilter(filters);
  }
}

