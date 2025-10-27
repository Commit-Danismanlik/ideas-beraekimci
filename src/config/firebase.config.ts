import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase konfigürasyon interface'i
export interface IFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase yapılandırması - Kendi değerlerinizle değiştirin
const firebaseConfig: IFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Firebase singleton instance
class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private db: Firestore;
  private authInstance: Auth;

  private constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.authInstance = getAuth(this.app);
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public getApp(): FirebaseApp {
    return this.app;
  }

  public getFirestore(): Firestore {
    return this.db;
  }

  public getAuth(): Auth {
    return this.authInstance;
  }
}

// Export edilebilir fonksiyonlar
export const getFirebaseApp = (): FirebaseApp => {
  return FirebaseService.getInstance().getApp();
};

export const getFirestoreDb = (): Firestore => {
  return FirebaseService.getInstance().getFirestore();
};

export const getFirebaseAuth = (): Auth => {
  return FirebaseService.getInstance().getAuth();
};

