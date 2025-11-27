import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
} from 'firebase/auth';
import { IAuthService } from '../interfaces/IAuthService';
import { IUserService } from '../interfaces/IUserService';
import { IAuthUser, IRegisterDto, ILoginDto, IAuthResult, IPasswordResetDto, IConfirmPasswordResetDto } from '../models/Auth.model';

// SOLID: Single Responsibility - Sadece authentication işlemlerinden sorumlu
export class AuthService implements IAuthService {
  private auth: Auth;
  private userService: IUserService;

  constructor(auth: Auth, userService: IUserService) {
    this.auth = auth;
    this.userService = userService;
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

      // Email doğrulama maili gönder
      try {
        await sendEmailVerification(userCredential.user, {
          url: typeof window !== 'undefined' 
            ? (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1'
              ? 'http://localhost:3000/login'
              : 'https://students.beraekimci.com.tr/login')
            : 'https://students.beraekimci.com.tr/login',
          handleCodeInApp: false,
        });
      } catch (emailError) {
        console.error('Email doğrulama maili gönderilemedi:', emailError);
        // Email gönderilemese bile kayıt başarılı sayılır
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

      // Email doğrulama kontrolü
      if (!userCredential.user.emailVerified) {
        // Kullanıcıyı çıkış yaptır
        await signOut(this.auth);
        return {
          success: false,
          error: 'Lütfen email adresinizi doğrulayın. Email kutunuzu kontrol edin.',
        };
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

  // Send Password Reset Email
  public async sendPasswordResetEmail(dto: IPasswordResetDto): Promise<IAuthResult> {
    try {
      // Email validasyonu
      if (!this.isValidEmail(dto.email)) {
        return {
          success: false,
          error: 'Geçersiz email adresi',
        };
      }

      // Email'in veritabanında olup olmadığını kontrol et
      const emailExists = await this.userService.emailExists(dto.email);
      if (!emailExists) {
        // Güvenlik nedeniyle genel bir mesaj döndür
        return {
          success: false,
          error: 'Bu email adresine kayıtlı kullanıcı bulunamadı',
        };
      }

      // URL yapılandırması - localhost ve production için dinamik
      let continueUrl: string;
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname.includes('localhost') || hostname === '127.0.0.1') {
          continueUrl = 'http://localhost:3000/login';
        } else {
          continueUrl = 'https://students.beraekimci.com.tr/login';
        }
      } else {
        // Server-side rendering durumunda production URL'i kullan
        continueUrl = 'https://students.beraekimci.com.tr/login';
      }

      // Firebase şifre sıfırlama email'i gönder
      await sendPasswordResetEmail(this.auth, dto.email, {
        url: continueUrl,
        handleCodeInApp: false,
      });

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

  // Confirm Password Reset
  public async confirmPasswordReset(dto: IConfirmPasswordResetDto): Promise<IAuthResult> {
    try {
      // Password validasyonu
      if (dto.newPassword.length < 6) {
        return {
          success: false,
          error: 'Şifre en az 6 karakter olmalıdır',
        };
      }

      // Firebase şifre sıfırlama onayı
      await confirmPasswordReset(this.auth, dto.oobCode, dto.newPassword);

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

  // Send Email Verification
  public async sendEmailVerification(): Promise<IAuthResult> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return {
          success: false,
          error: 'Kullanıcı giriş yapmamış',
        };
      }

      if (currentUser.emailVerified) {
        return {
          success: false,
          error: 'Email adresi zaten doğrulanmış',
        };
      }

      // URL yapılandırması - localhost ve production için dinamik
      let continueUrl: string;
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname.includes('localhost') || hostname === '127.0.0.1') {
          continueUrl = 'http://localhost:3000/login';
        } else {
          continueUrl = 'https://students.beraekimci.com.tr/login';
        }
      } else {
        continueUrl = 'https://students.beraekimci.com.tr/login';
      }

      // Firebase email doğrulama maili gönder
      await sendEmailVerification(currentUser, {
        url: continueUrl,
        handleCodeInApp: false,
      });

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
      if (message.includes('auth/invalid-action-code')) {
        return 'Geçersiz veya süresi dolmuş şifre sıfırlama kodu';
      }
      if (message.includes('auth/expired-action-code')) {
        return 'Şifre sıfırlama kodu süresi dolmuş';
      }
      if (message.includes('auth/user-not-found')) {
        return 'Bu email adresine kayıtlı kullanıcı bulunamadı';
      }
      
      return message;
    }
    return 'Bilinmeyen bir hata oluştu';
  }
}

