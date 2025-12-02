import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { getTeamService } from '../di/container';
import { ITeam } from '../models/Team.model';

export type ViewType = 'repositories' | 'tasks' | 'personal' | 'management' | 'myteam';

export interface UseDashboardReturn {
  userTeams: ITeam[];
  activeView: ViewType;
  loading: boolean;
  showProfileModal: boolean;
  showChatBot: boolean;
  isMobileMenuOpen: boolean;
  selectedTeamId: string | null;
  canManageTeam: boolean;
  hasTeam: boolean;
  setActiveView: (view: ViewType) => void;
  setShowProfileModal: (show: boolean) => void;
  setShowChatBot: (show: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => Promise<void>;
  handleTeamChange: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [activeView, setActiveView] = useState<ViewType>('personal');
  const [userTeams, setUserTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showChatBot, setShowChatBot] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const teamService = getTeamService();
  const { hasPermission } = usePermissions(selectedTeamId);

  // Yönetim sayfasını görebilir mi?
  const isOwnerOfAnyTeam = userTeams.some((team) => team.ownerId === user?.uid);
  const canManageTeam =
    isOwnerOfAnyTeam ||
    hasPermission('MANAGE_ROLES') ||
    hasPermission('MANAGE_MEMBERS');

  useEffect(() => {
    const fetchUserTeams = async (): Promise<void> => {
      if (user) {
        setLoading(true);
        const result = await teamService.getUserTeams(user.uid);
        if (result.success) {
          setUserTeams(result.data);
          // İlk takımı seç (permission kontrolü için)
          if (result.data.length > 0) {
            setSelectedTeamId(result.data[0].id);
          }
        }
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, [user, teamService]);

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleTeamChange = useCallback((): void => {
    // Takım değişikliğinden sonra yeniden fetch
    if (user) {
      teamService.getUserTeams(user.uid).then((result) => {
        if (result.success) {
          setUserTeams(result.data);
        }
      });
    }
  }, [user, teamService]);

  const hasTeam = userTeams.length > 0;

  return {
    userTeams,
    activeView,
    loading,
    showProfileModal,
    showChatBot,
    isMobileMenuOpen,
    selectedTeamId,
    canManageTeam,
    hasTeam,
    setActiveView,
    setShowProfileModal,
    setShowChatBot,
    setIsMobileMenuOpen,
    handleLogout,
    handleTeamChange,
  };
};

