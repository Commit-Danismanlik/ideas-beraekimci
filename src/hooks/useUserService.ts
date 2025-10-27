import { useState, useCallback } from 'react';
import { IUserService } from '../interfaces/IUserService';
import { IUser, ICreateUserDto, IUpdateUserDto } from '../models/User.model';
import { IQueryResult, IListQueryResult, IPagination, IOrderBy } from '../types/base.types';
import { getUserService } from '../di/container';

// Custom hook - User işlemleri için
export const useUserService = () => {
  const [userService] = useState<IUserService>(() => getUserService());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create User
  const createUser = useCallback(
    async (dto: ICreateUserDto): Promise<IQueryResult<IUser>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await userService.createUser(dto);
        if (!result.success) {
          setError(result.error || 'Kullanıcı oluşturulamadı');
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
    [userService]
  );

  // Get User By Id
  const getUserById = useCallback(
    async (id: string): Promise<IQueryResult<IUser>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await userService.getUserById(id);
        if (!result.success) {
          setError(result.error || 'Kullanıcı bulunamadı');
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
    [userService]
  );

  // Get All Users
  const getAllUsers = useCallback(async (): Promise<IListQueryResult<IUser>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getAllUsers();
      if (!result.success) {
        setError(result.error || 'Kullanıcılar getirilemedi');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      return { success: false, data: [], error: errorMessage, total: 0 };
    } finally {
      setLoading(false);
    }
  }, [userService]);

  // Update User
  const updateUser = useCallback(
    async (id: string, dto: IUpdateUserDto): Promise<IQueryResult<IUser>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await userService.updateUser(id, dto);
        if (!result.success) {
          setError(result.error || 'Kullanıcı güncellenemedi');
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
    [userService]
  );

  // Delete User
  const deleteUser = useCallback(
    async (id: string): Promise<IQueryResult<boolean>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await userService.deleteUser(id);
        if (!result.success) {
          setError(result.error || 'Kullanıcı silinemedi');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, data: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [userService]
  );

  // Get User By Email
  const getUserByEmail = useCallback(
    async (email: string): Promise<IQueryResult<IUser>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await userService.getUserByEmail(email);
        if (!result.success) {
          setError(result.error || 'Kullanıcı bulunamadı');
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
    [userService]
  );

  // Get Active Users
  const getActiveUsers = useCallback(async (): Promise<IListQueryResult<IUser>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getActiveUsers();
      if (!result.success) {
        setError(result.error || 'Aktif kullanıcılar getirilemedi');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      return { success: false, data: [], error: errorMessage, total: 0 };
    } finally {
      setLoading(false);
    }
  }, [userService]);

  // Get Users With Pagination
  const getUsersWithPagination = useCallback(
    async (
      pagination: IPagination,
      orderBy?: IOrderBy
    ): Promise<IListQueryResult<IUser>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await userService.getUsersWithPagination(pagination, orderBy);
        if (!result.success) {
          setError(result.error || 'Kullanıcılar getirilemedi');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        return { success: false, data: [], error: errorMessage, total: 0 };
      } finally {
        setLoading(false);
      }
    },
    [userService]
  );

  // Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Actions
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserByEmail,
    getActiveUsers,
    getUsersWithPagination,
    clearError,
    
    // Service instance (gerekirse direkt erişim için)
    userService,
  };
};

