import { useState, useEffect, useCallback } from 'react';
import { IAuthService } from '../interfaces/IAuthService';
import { IAuthUser, IRegisterDto, ILoginDto, IAuthResult, IPasswordResetDto, IConfirmPasswordResetDto } from '../models/Auth.model';
import { getAuthService, getUserService } from '../di/container';

export const useAuth = () => {
  const [authService] = useState<IAuthService>(() => {
    try {
      return getAuthService();
    } catch (error) {
      console.error('AuthService initialization error:', error);
      throw error;
    }
  });
  const [userService] = useState(() => {
    try {
      return getUserService();
    } catch (error) {
      console.error('UserService initialization error:', error);
      throw error;
    }
  });
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Auth state observer
  useEffect(() => {
    try {
      const unsubscribe = authService.onAuthStateChanged((authUser) => {
        setUser(authUser);
        setIsAuthenticated(!!authUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Auth state observer error:', err);
      setError('Auth initialization failed');
      setLoading(false);
    }
  }, [authService]);

  // Register
  const register = useCallback(
    async (dto: IRegisterDto): Promise<IAuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.register(dto);
        if (result.success && result.user) {
          // Firebase Authentication'dan sonra Firestore'a kaydet
          try {
            // Authentication UID ile aynı ID'yi kullanarak kaydet
            const { setDoc, doc } = await import('firebase/firestore');
            const { getFirestore } = await import('firebase/firestore');
            const db = getFirestore();
            await setDoc(doc(db, 'users', result.user.uid), {
              id: result.user.uid,
              name: dto.displayName || '',
              email: dto.email,
              birthDate: dto.birthDate || null,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log('Kullanıcı Firestore\'a kaydedildi:', result.user.uid);
          } catch (dbError) {
            console.error('Firestore kayıt hatası:', dbError);
            // Hata olsa bile authentication başarılı olduğu için devam et
          }
        }
        if (!result.success) {
          setError(result.error || 'Kayıt başarısız');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [authService, userService]
  );

  // Login
  const login = useCallback(
    async (dto: ILoginDto): Promise<IAuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.login(dto);
        if (result.success && result.user) {
          // Kullanıcının Firestore'da olup olmadığını kontrol et
          try {
            const userResult = await userService.getUserById(result.user.uid);
            if (!userResult.success || !userResult.data) {
              // Kullanıcı Firestore'da yok, ekle
              console.log('Kullanıcı Firestore\'da yok, ekleniyor...');
              const { setDoc, doc } = await import('firebase/firestore');
              const { getFirestore } = await import('firebase/firestore');
              const db = getFirestore();
              await setDoc(doc(db, 'users', result.user.uid), {
                id: result.user.uid,
                name: result.user.displayName || '',
                email: result.user.email || dto.email,
                birthDate: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              console.log('Kullanıcı Firestore\'a eklendi:', result.user.uid);
            }
          } catch (dbError) {
            console.error('Firestore kontrol hatası:', dbError);
            // Hata olsa bile authentication başarılı olduğu için devam et
          }
        }
        if (!result.success) {
          setError(result.error || 'Giriş başarısız');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [authService, userService]
  );

  // Logout
  const logout = useCallback(async (): Promise<IAuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.logout();
      if (!result.success) {
        setError(result.error || 'Çıkış başarısız');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [authService]);

  // Send Password Reset Email
  const sendPasswordResetEmail = useCallback(
    async (dto: IPasswordResetDto): Promise<IAuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.sendPasswordResetEmail(dto);
        if (!result.success) {
          setError(result.error || 'Şifre sıfırlama emaili gönderilemedi');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [authService]
  );

  // Confirm Password Reset
  const confirmPasswordReset = useCallback(
    async (dto: IConfirmPasswordResetDto): Promise<IAuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.confirmPasswordReset(dto);
        if (!result.success) {
          setError(result.error || 'Şifre sıfırlama başarısız');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [authService]
  );

  // Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,

    // Actions
    register,
    login,
    logout,
    sendPasswordResetEmail,
    confirmPasswordReset,
    clearError,

    // Service
    authService,
  };
};

