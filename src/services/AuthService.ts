import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { IAuthService } from '../interfaces/IAuthService';
import { IAuthUser, IRegisterDto, ILoginDto, IAuthResult } from '../models/Auth.model';

// SOLID: Single Responsibility - Sadece authentication işlemlerinden sorumlu
export class AuthService implements IAuthService {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  // Register
  public async register(dto: IRegisterDto): Promise<IAuthResult> {
    try {
      // Email validasyonu
      if (!this.isValidEmail(dto.email)) {
        return {
          success: false,
          error: 'Geçersiz email adresi',
        };
      }

      // Password validasyonu
      if (dto.password.length < 6) {
        return {
          success: false,
          error: 'Şifre en az 6 karakter olmalıdır',
        };
      }

      // Firebase'de kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        dto.email,
        dto.password
      );

      // Display name güncelle
      if (dto.displayName) {
        await updateProfile(userCredential.user, {
          displayName: dto.displayName,
        });
      }

      const authUser = this.mapFirebaseUserToAuthUser(userCredential.user);

      return {
        success: true,
        user: authUser,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Login
  public async login(dto: ILoginDto): Promise<IAuthResult> {
    try {
      // Email validasyonu
      if (!this.isValidEmail(dto.email)) {
        return {
          success: false,
          error: 'Geçersiz email adresi',
        };
      }

      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        dto.email,
        dto.password
      );

      const authUser = this.mapFirebaseUserToAuthUser(userCredential.user);

      return {
        success: true,
        user: authUser,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Logout
  public async logout(): Promise<IAuthResult> {
    try {
      await signOut(this.auth);
      return {
        success: true,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get Current User
  public getCurrentUser(): IAuthUser | null {
    const user = this.auth.currentUser;
    if (!user) {
      return null;
    }
    return this.mapFirebaseUserToAuthUser(user);
  }

  // Auth State Observer
  public onAuthStateChanged(callback: (user: IAuthUser | null) => void): () => void {
    const unsubscribe = firebaseOnAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this.mapFirebaseUserToAuthUser(firebaseUser));
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  // Private helper metodları
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private mapFirebaseUserToAuthUser(user: User): IAuthUser {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime
        ? new Date(user.metadata.creationTime)
        : new Date(),
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      // Firebase error kodlarını Türkçe'ye çevir
      const message = error.message;
      
      if (message.includes('auth/email-already-in-use')) {
        return 'Bu email adresi zaten kullanılıyor';
      }
      if (message.includes('auth/invalid-email')) {
        return 'Geçersiz email adresi';
      }
      if (message.includes('auth/operation-not-allowed')) {
        return 'Bu işlem şu anda kullanılamıyor';
      }
      if (message.includes('auth/weak-password')) {
        return 'Şifre çok zayıf';
      }
      if (message.includes('auth/user-disabled')) {
        return 'Bu kullanıcı devre dışı bırakılmış';
      }
      if (message.includes('auth/user-not-found')) {
        return 'Kullanıcı bulunamadı';
      }
      if (message.includes('auth/wrong-password')) {
        return 'Hatalı şifre';
      }
      if (message.includes('auth/invalid-credential')) {
        return 'Geçersiz kullanıcı bilgileri';
      }
      
      return message;
    }
    return 'Bilinmeyen bir hata oluştu';
  }
}

