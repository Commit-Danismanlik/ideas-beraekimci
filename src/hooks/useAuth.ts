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
            await userService.createOrUpdateUserFromAuth(
              result.user.uid,
              result.user.email,
              dto.displayName,
              dto.birthDate
            );
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
          // Kullanıcının Firestore'da olup olmadığını kontrol et ve yoksa ekle
          try {
            await userService.createOrUpdateUserFromAuth(
              result.user.uid,
              result.user.email,
              result.user.displayName
            );
            console.log('Kullanıcı Firestore\'da kontrol edildi/güncellendi:', result.user.uid);
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

  // Send Email Verification
  const sendEmailVerification = useCallback(
    async (): Promise<IAuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.sendEmailVerification();
        if (!result.success) {
          setError(result.error || 'Email doğrulama maili gönderilemedi');
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
    sendEmailVerification,
    clearError,

    // Service
    authService,
  };
};

