import { DocumentData, Firestore, Timestamp, collection, query, orderBy, limit as fbLimit, getDocs } from 'firebase/firestore';
import { SubcollectionRepository } from './SubcollectionRepository';
import { IChatConversation } from '../models/ChatConversation.model';
import { IListQueryResult } from '../types/base.types';
import { IChatMessage } from '../interfaces/IChatBotService';

export class ChatConversationRepository extends SubcollectionRepository<IChatConversation> {
  constructor(firestore: Firestore) {
    super('teams', 'chatConversations', firestore);
  }

  protected toFirestore(data: Partial<IChatConversation>): DocumentData {
    const firestoreData: DocumentData = {};

    if (data.title !== undefined) firestoreData.title = data.title;
    if (data.messages !== undefined) {
      // IChatMessage array'ini Firestore'a uygun formata çevir
      firestoreData.messages = data.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        userId: msg.userId || null,
        timestamp: msg.timestamp ? Timestamp.fromDate(msg.timestamp) : Timestamp.now(),
      }));
    }
    if (data.teamId !== undefined) firestoreData.teamId = data.teamId;
    if (data.createdAt !== undefined) {
      firestoreData.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt !== undefined) {
      firestoreData.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    return firestoreData;
  }

  protected fromFirestore(data: DocumentData): IChatConversation {
    const messages: IChatMessage[] = [];
    if (data.messages && Array.isArray(data.messages)) {
      messages.push(
        ...data.messages.map((msg: DocumentData) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content as string,
          userId: msg.userId as string | undefined,
          timestamp: (msg.timestamp as Timestamp).toDate(),
        }))
      );
    }

    return {
      id: data.id as string,
      title: data.title as string,
      messages,
      teamId: data.teamId as string,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  // Son oluşturulan konuşmaları getir (createdAt desc, limit)
  public async getRecent(teamId: string, take: number): Promise<IListQueryResult<IChatConversation>> {
    try {
      const subRef = collection(this.db, 'teams', teamId, 'chatConversations');
      const q = query(subRef, orderBy('createdAt', 'desc'), fbLimit(take));
      const snap = await getDocs(q);
      const data: IChatConversation[] = [];
      snap.forEach((doc) => {
        data.push(
          this.fromFirestore({ id: doc.id, ...doc.data() })
        );
      });
      return { success: true, data, total: data.length };
    } catch (error) {
      return { 
        success: false, 
        data: [], 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        total: 0 
      };
    }
  }

  // Tüm konuşmaları tarih sırasına göre getir (createdAt desc)
  public async getAllOrderedByDate(teamId: string): Promise<IListQueryResult<IChatConversation>> {
    try {
      const subRef = collection(this.db, 'teams', teamId, 'chatConversations');
      const q = query(subRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data: IChatConversation[] = [];
      snap.forEach((doc) => {
        data.push(
          this.fromFirestore({ id: doc.id, ...doc.data() })
        );
      });
      return { success: true, data, total: data.length };
    } catch (error) {
      return { 
        success: false, 
        data: [], 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        total: 0 
      };
    }
  }
}
