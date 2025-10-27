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
  DocumentData,
  QueryConstraint,
  Firestore,
  Timestamp,
  getCountFromServer,
  WhereFilterOp,
} from 'firebase/firestore';
import {
  IQueryResult,
  IListQueryResult,
  IFilter,
  IBaseEntity,
} from '../types/base.types';

// Subcollection için Base Repository
export abstract class SubcollectionRepository<T extends IBaseEntity> {
  protected parentCollectionName: string;
  protected subcollectionName: string;
  protected db: Firestore;

  constructor(parentCollection: string, subcollection: string, firestore: Firestore) {
    this.parentCollectionName = parentCollection;
    this.subcollectionName = subcollection;
    this.db = firestore;
  }

  protected abstract toFirestore(data: Partial<T>): DocumentData;
  protected abstract fromFirestore(data: DocumentData): T;

  // Create
  public async create(parentId: string, data: Omit<T, 'id'>): Promise<IQueryResult<T>> {
    try {
      const subcollectionRef = collection(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName
      );
      
      const now = Timestamp.now();
      const firestoreData = this.toFirestore({
        ...data,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as Partial<T>);

      const docRef = await addDoc(subcollectionRef, firestoreData);
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

  // Get By Id
  public async getById(parentId: string, id: string): Promise<IQueryResult<T>> {
    try {
      const docRef = doc(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName,
        id
      );
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

  // Get All
  public async getAll(parentId: string): Promise<IListQueryResult<T>> {
    try {
      const subcollectionRef = collection(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName
      );
      const querySnapshot = await getDocs(subcollectionRef);

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

  // Get By Filter
  public async getByFilter(parentId: string, filters: IFilter[]): Promise<IListQueryResult<T>> {
    try {
      const subcollectionRef = collection(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName
      );
      const constraints: QueryConstraint[] = filters.map((filter) =>
        where(filter.field, filter.operator as WhereFilterOp, filter.value)
      );

      const q = query(subcollectionRef, ...constraints);
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

  // Update
  public async update(parentId: string, id: string, data: Partial<T>): Promise<IQueryResult<T>> {
    try {
      const docRef = doc(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName,
        id
      );
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
  public async delete(parentId: string, id: string): Promise<IQueryResult<boolean>> {
    try {
      const docRef = doc(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName,
        id
      );
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

  // Count
  public async count(parentId: string): Promise<number> {
    try {
      const subcollectionRef = collection(
        this.db,
        this.parentCollectionName,
        parentId,
        this.subcollectionName
      );
      const snapshot = await getCountFromServer(subcollectionRef);
      return snapshot.data().count;
    } catch (error) {
      return 0;
    }
  }
}

