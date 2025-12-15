import { useState, useEffect, useCallback } from 'react';
import { getTeamNoteService, getTeamTodoService, getTeamMemberInfoService } from '../di/container';
import { ITeamNote, ITeamTodo } from '../models/TeamRepository.model';
import { IMemberWithRole } from '../services/TeamMemberInfoService';
import { ITeam } from '../models/Team.model';

type TabType = 'notes' | 'todos';

interface INoteFilter {
  dateSort: 'newest' | 'oldest';
  creatorId: string;
}

interface ITodoFilter {
  dateSort: 'newest' | 'oldest';
  creatorId: string;
}

export interface UseRepositoriesState {
  // Data
  notes: ITeamNote[];
  todos: ITeamTodo[];
  filteredNotes: ITeamNote[];
  filteredTodos: ITeamTodo[];
  members: IMemberWithRole[];
  loading: boolean;
  hasMore: boolean;

  // Tab
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Search
  noteSearchQuery: string;
  setNoteSearchQuery: (query: string) => void;
  todoSearchQuery: string;
  setTodoSearchQuery: (query: string) => void;

  // Filters
  noteFilter: INoteFilter;
  setNoteFilter: (filter: INoteFilter) => void;
  todoFilter: ITodoFilter;
  setTodoFilter: (filter: ITodoFilter) => void;

  // Actions
  fetchData: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  loadMore: () => Promise<void>;
  getUserName: (userId: string) => string;
}

/**
 * useRepositories Hook
 * SOLID: Single Responsibility - Sadece repository state ve logic'inden sorumlu
 */
export const useRepositories = (
  selectedTeam: string,
  userTeams: ITeam[]
): UseRepositoriesState => {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [notes, setNotes] = useState<ITeamNote[]>([]);
  const [todos, setTodos] = useState<ITeamTodo[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<ITeamNote[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<ITeamTodo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<IMemberWithRole[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastNoteCreatedAt, setLastNoteCreatedAt] = useState<Date | null>(null);
  const [lastTodoCreatedAt, setLastTodoCreatedAt] = useState<Date | null>(null);
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [todoSearchQuery, setTodoSearchQuery] = useState<string>('');
  const [noteFilter, setNoteFilter] = useState<INoteFilter>({
    dateSort: 'newest',
    creatorId: 'all',
  });
  const [todoFilter, setTodoFilter] = useState<ITodoFilter>({
    dateSort: 'newest',
    creatorId: 'all',
  });

  const noteService = getTeamNoteService();
  const todoService = getTeamTodoService();
  const memberInfoService = getTeamMemberInfoService();

  const fetchMembers = useCallback(async (): Promise<void> => {
    if (!selectedTeam) {
      return;
    }
    const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);
    if (!selectedTeamData) {
      return;
    }

    try {
      // Cache'i temizle - yeni kullanıcı bilgileri için
      memberInfoService.invalidateCache(selectedTeam);
      
      const membersData = await memberInfoService.getMembersWithInfo(
        selectedTeam,
        selectedTeamData.members
      );
      setMembers(membersData);
    } catch (error) {
      console.error('Üyeler alınamadı:', error);
    }
  }, [selectedTeam, userTeams, memberInfoService]);

  const getUserName = useCallback(
    (userId: string): string => {
      const member = members.find((m) => m.userId === userId);
      return member?.displayName || member?.email || userId;
    },
    [members]
  );

  // Client-side filtreleme (veri zaten yüklü) - useMemo ile optimize edildi
  const applyFilters = useCallback((): void => {
    if (activeTab === 'notes' && notes.length > 0) {
      let filtered = [...notes];

      // Arama filtresini uygula
      if (noteSearchQuery.trim()) {
        filtered = filtered.filter(
          (note) =>
            note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
            note.category?.toLowerCase().includes(noteSearchQuery.toLowerCase())
        );
      }

      // Filtreleri uygula
      if (noteFilter.creatorId !== 'all') {
        filtered = filtered.filter((note) => note.createdBy === noteFilter.creatorId);
      }

      // Tarihe göre sırala
      if (noteFilter.dateSort === 'newest') {
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        filtered.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      // Sabitlenmiş notları en başa taşı
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) {
          return -1;
        }
        if (!a.isPinned && b.isPinned) {
          return 1;
        }
        return 0;
      });

      setFilteredNotes(filtered);
    } else if (activeTab === 'todos' && todos.length > 0) {
      let filtered = [...todos];

      // Arama filtresini uygula
      if (todoSearchQuery.trim()) {
        filtered = filtered.filter(
          (todo) =>
            todo.title.toLowerCase().includes(todoSearchQuery.toLowerCase()) ||
            todo.description?.toLowerCase().includes(todoSearchQuery.toLowerCase())
        );
      }

      // Filtreleri uygula
      if (todoFilter.creatorId !== 'all') {
        filtered = filtered.filter((todo) => todo.createdBy === todoFilter.creatorId);
      }

      // Tarihe göre sırala
      if (todoFilter.dateSort === 'newest') {
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        filtered.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      setFilteredTodos(filtered);
    }
  }, [activeTab, notes, todos, noteSearchQuery, todoSearchQuery, noteFilter, todoFilter]);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!selectedTeam) {
      return;
    }

    setLoading(true);
    if (activeTab === 'notes') {
      // Her zaman tüm notları çek (filtreleme ve pagination için gerekli)
      const result = await noteService.getTeamNotes(selectedTeam);
      if (result.success) {
        setNotes(result.data);
        setHasMore(false);
        setLastNoteCreatedAt(null);
      }
    } else {
      // Her zaman tüm todo'ları çek (filtreleme ve pagination için gerekli)
      const result = await todoService.getTeamTodos(selectedTeam);
      if (result.success) {
        setTodos(result.data);
        setHasMore(false);
        setLastTodoCreatedAt(null);
      }
    }
    setLoading(false);
  }, [selectedTeam, activeTab, noteService, todoService]);

  // loadMore artık gereksiz - tüm veriler zaten çekiliyor, pagination frontend'de yapılıyor
  const loadMore = useCallback(async (): Promise<void> => {
    // Boş fonksiyon - pagination artık frontend'de yapılıyor
  }, []);

  // Sadece team veya tab değiştiğinde veri çek
  useEffect(() => {
    if (selectedTeam) {
      fetchData();
      fetchMembers();
    }
  }, [selectedTeam, activeTab, fetchData, fetchMembers]);

  // Veri yüklendikten sonra filtreleri uygula
  useEffect(() => {
    if ((activeTab === 'notes' && notes.length > 0) || (activeTab === 'todos' && todos.length > 0)) {
      applyFilters();
    }
  }, [notes, todos, applyFilters, activeTab]);

  return {
    notes,
    todos,
    filteredNotes,
    filteredTodos,
    members,
    loading,
    hasMore,
    activeTab,
    setActiveTab,
    noteSearchQuery,
    setNoteSearchQuery,
    todoSearchQuery,
    setTodoSearchQuery,
    noteFilter,
    setNoteFilter,
    todoFilter,
    setTodoFilter,
    fetchData,
    fetchMembers,
    loadMore,
    getUserName,
  };
};

