import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getRoleService } from '../di/container';
import { Permission } from '../models/Role.model';

export const usePermissions = (teamId: string | null) => {
  const { user } = useAuthContext();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const roleService = getRoleService();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user || !teamId) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userPermissions = await roleService.getUserPermissions(user.uid, teamId);
      setPermissions(userPermissions);
      console.log('Kullanıcı yetkileri:', userPermissions);
      setLoading(false);
    };

    fetchPermissions();
  }, [user, teamId]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

