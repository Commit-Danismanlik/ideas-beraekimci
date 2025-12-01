import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
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
  const { user } = useAuthContext();
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
      // İlk 6 notu çek (performans için)
      const take = 6;
      const result = await noteService.getRecentNotes(selectedTeam, take);
      if (result.success) {
        setNotes(result.data);
        const hasFilterOrSearch = noteSearchQuery.trim() !== '' || noteFilter.creatorId !== 'all';
        setHasMore(!hasFilterOrSearch && result.data.length === take);
        const last = result.data[result.data.length - 1];
        setLastNoteCreatedAt(last ? last.createdAt : null);
      }
    } else {
      // İlk 6 todo'yu çek (performans için)
      const take = 6;
      const result = await todoService.getRecentTodos(selectedTeam, take);
      if (result.success) {
        setTodos(result.data);
        const hasFilterOrSearch = todoSearchQuery.trim() !== '' || todoFilter.creatorId !== 'all';
        setHasMore(!hasFilterOrSearch && result.data.length === take);
        const last = result.data[result.data.length - 1];
        setLastTodoCreatedAt(last ? last.createdAt : null);
      }
    }
    setLoading(false);
  }, [selectedTeam, activeTab, noteService, todoService, noteSearchQuery, todoSearchQuery, noteFilter, todoFilter]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!selectedTeam || !hasMore) {
      return;
    }

    // Filtreleme/arama yapıldığında pagination'ı devre dışı bırak
    if (activeTab === 'notes') {
      const hasFilterOrSearch = noteSearchQuery.trim() !== '' || noteFilter.creatorId !== 'all';
      if (hasFilterOrSearch || !lastNoteCreatedAt) {
        return;
      }

      setLoading(true);
      try {
        const take = 6;
        const result = await noteService.getRecentNotesBefore(selectedTeam, lastNoteCreatedAt, take);
        if (result.success && result.data.length > 0) {
          setNotes((prev) => {
            const newNotes = [...prev, ...result.data];
            setHasMore(result.data.length === take);
            const last = result.data[result.data.length - 1];
            setLastNoteCreatedAt(last.createdAt);
            return newNotes;
          });
        } else {
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Todo'lar için pagination
      const hasFilterOrSearch = todoSearchQuery.trim() !== '' || todoFilter.creatorId !== 'all';
      if (hasFilterOrSearch || !lastTodoCreatedAt) {
        return;
      }

      setLoading(true);
      try {
        const take = 6;
        const result = await todoService.getRecentTodosBefore(selectedTeam, lastTodoCreatedAt, take);
        if (result.success && result.data.length > 0) {
          setTodos((prev) => {
            const newTodos = [...prev, ...result.data];
            setHasMore(result.data.length === take);
            const last = result.data[result.data.length - 1];
            setLastTodoCreatedAt(last.createdAt);
            return newTodos;
          });
        } else {
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [selectedTeam, hasMore, activeTab, lastNoteCreatedAt, lastTodoCreatedAt, noteSearchQuery, todoSearchQuery, noteFilter, todoFilter, noteService, todoService]);

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

