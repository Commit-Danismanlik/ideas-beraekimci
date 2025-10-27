import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Firestore,
  Timestamp,
  getCountFromServer,
  WhereFilterOp,
} from 'firebase/firestore';
import { IRepository } from '../interfaces/IRepository';
import {
  IQueryResult,
  IListQueryResult,
  IFilter,
  IOrderBy,
  IPagination,
  IBaseEntity,
} from '../types/base.types';

// SOLID: Open/Closed Principle - Genişlemeye açık, değişime kapalı
export abstract class BaseRepository<T extends IBaseEntity> implements IRepository<T> {
  protected collectionName: string;
  protected db: Firestore;

  constructor(collectionName: string, firestore: Firestore) {
    this.collectionName = collectionName;
    this.db = firestore;
  }

  // Abstract metodlar - Alt sınıflar tarafından implement edilmeli
  protected abstract toFirestore(data: Partial<T>): DocumentData;
  protected abstract fromFirestore(data: DocumentData): T;

  // Create
  public async create(data: Omit<T, 'id'>): Promise<IQueryResult<T>> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const now = Timestamp.now();
      
      const firestoreData = this.toFirestore({
        ...data,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as Partial<T>);

      const docRef = await addDoc(collectionRef, firestoreData);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Döküman oluşturulamadı',
        };
      }

      const createdData = this.fromFirestore({
        id: docSnap.id,
        ...docSnap.data(),
      });

      return {
        success: true,
        data: createdData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  // Read - GetById
  public async getById(id: string): Promise<IQueryResult<T>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Döküman bulunamadı',
        };
      }

      const data = this.fromFirestore({
        id: docSnap.id,
        ...docSnap.data(),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  // Read - GetAll
  public async getAll(): Promise<IListQueryResult<T>> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const querySnapshot = await getDocs(collectionRef);

      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push(
          this.fromFirestore({
            id: doc.id,
            ...doc.data(),
          })
        );
      });

      return {
        success: true,
        data,
        total: data.length,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        total: 0,
      };
    }
  }

  // Read - GetByFilter
  public async getByFilter(filters: IFilter[]): Promise<IListQueryResult<T>> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const constraints: QueryConstraint[] = filters.map((filter) =>
        where(filter.field, filter.operator as WhereFilterOp, filter.value)
      );

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push(
          this.fromFirestore({
            id: doc.id,
            ...doc.data(),
          })
        );
      });

      return {
        success: true,
        data,
        total: data.length,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        total: 0,
      };
    }
  }

  // Read - GetWithPagination
  public async getWithPagination(
    pagination: IPagination,
    orderByConfig?: IOrderBy
  ): Promise<IListQueryResult<T>> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      if (orderByConfig) {
        constraints.push(orderBy(orderByConfig.field, orderByConfig.direction));
      }

      constraints.push(limit(pagination.limit));

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push(
          this.fromFirestore({
            id: doc.id,
            ...doc.data(),
          })
        );
      });

      // Total count
      const countSnapshot = await getCountFromServer(collectionRef);
      const total = countSnapshot.data().count;

      return {
        success: true,
        data,
        total,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        total: 0,
      };
    }
  }

  // Update
  public async update(id: string, data: Partial<T>): Promise<IQueryResult<T>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const now = Timestamp.now();

      const updateData = this.toFirestore({
        ...data,
        updatedAt: now.toDate(),
      });

      await updateDoc(docRef, updateData);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Döküman bulunamadı',
        };
      }

      const updatedData = this.fromFirestore({
        id: docSnap.id,
        ...docSnap.data(),
      });

      return {
        success: true,
        data: updatedData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  // Delete
  public async delete(id: string): Promise<IQueryResult<boolean>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  // Utility - Exists
  public async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      return false;
    }
  }

  // Utility - Count
  public async count(): Promise<number> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const snapshot = await getCountFromServer(collectionRef);
      return snapshot.data().count;
    } catch (error) {
      return 0;
    }
  }

  // Utility - CountByFilter
  public async countByFilter(filters: IFilter[]): Promise<number> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const constraints: QueryConstraint[] = filters.map((filter) =>
        where(filter.field, filter.operator as WhereFilterOp, filter.value)
      );

      const q = query(collectionRef, ...constraints);
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      return 0;
    }
  }
}

