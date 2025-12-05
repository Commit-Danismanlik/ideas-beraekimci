import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ITask } from '../models/Task.model';
import { IMemberWithRole } from '../services/TeamMemberInfoService';
import { getTaskService, getTeamMemberInfoService } from '../di/container';

export interface TaskFilters {
  status: 'all' | 'todo' | 'in-progress' | 'done';
  priority: 'all' | 'low' | 'medium' | 'high';
  assignedTo: string; // 'all' | 'unassigned' | userId
}

export interface UseTasksState {
  tasks: ITask[];
  filteredTasks: ITask[];
  members: IMemberWithRole[];
  membersMap: ReadonlyMap<string, IMemberWithRole>;
  loading: boolean;
  hasMore: boolean;
  filters: TaskFilters;
  setFilters: (next: TaskFilters) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedWeek: Date | null;
  setSelectedWeek: (d: Date | null) => void;
  fetchTasks: (teamId: string, teamMemberIds: string[] | undefined) => Promise<void>;
  loadMore: (teamId: string) => Promise<void>;
  createTask: (teamId: string, dto: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTask: (teamId: string, id: string, updates: Partial<ITask>) => Promise<boolean>;
  deleteTask: (teamId: string, id: string) => Promise<boolean>;
  counts: {
    total: number;
    byStatus: Readonly<Record<'todo' | 'in-progress' | 'done', number>>;
    byPriority: Readonly<Record<'low' | 'medium' | 'high', number>>;
    unassigned: number;
    byAssignee: Readonly<Record<string, number>>;
  };
}

const useDebouncedValue = (value: string, delayMs: number): string => {
  const [debounced, setDebounced] = useState<string>(value);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setDebounced(value), delayMs);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [value, delayMs]);

  return debounced;
};

export const useTasks = (): UseTasksState => {
  const taskService = getTaskService();
  const memberInfoService = getTeamMemberInfoService();

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [members, setMembers] = useState<IMemberWithRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<TaskFilters>({ status: 'all', priority: 'all', assignedTo: 'all' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(new Date()); // Default olarak bu hafta
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastCreatedAt, setLastCreatedAt] = useState<Date | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  const membersMap = useMemo(() => {
    const map = new Map<string, IMemberWithRole>();
    for (const m of members) {
      map.set(m.userId, m);
    }
    return map as ReadonlyMap<string, IMemberWithRole>;
  }, [members]);

  const getWeekRange = useCallback((date: Date): { start: Date; end: Date } => {
    const start = new Date(date);
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const filteredTasks = useMemo(() => {
    if (tasks.length === 0) return [] as ITask[];
    let list = tasks;

    // Arama
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((t) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }

    // Status
    if (filters.status !== 'all') {
      list = list.filter((t) => t.status === filters.status);
    }

    // Priority
    if (filters.priority !== 'all') {
      list = list.filter((t) => t.priority === filters.priority);
    }

    // Assignee
    if (filters.assignedTo !== 'all') {
      list = filters.assignedTo === 'unassigned' ? list.filter((t) => !t.assignedTo) : list.filter((t) => t.assignedTo === filters.assignedTo);
    }

    // Hafta
    if (selectedWeek) {
      const { start, end } = getWeekRange(selectedWeek);
      list = list.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= start && d <= end;
      });
    }

    return list;
  }, [tasks, filters, selectedWeek, debouncedSearch, getWeekRange]);

  const counts = useMemo(() => {
    const byStatus = { 'todo': 0, 'in-progress': 0, 'done': 0 } as Record<'todo' | 'in-progress' | 'done', number>;
    const byPriority = { 'low': 0, 'medium': 0, 'high': 0 } as Record<'low' | 'medium' | 'high', number>;
    const byAssignee: Record<string, number> = {};
    let unassigned = 0;
    for (const t of tasks) {
      byStatus[t.status] += 1;
      byPriority[t.priority] += 1;
      if (t.assignedTo) {
        byAssignee[t.assignedTo] = (byAssignee[t.assignedTo] || 0) + 1;
      } else {
        unassigned += 1;
      }
    }
    return {
      total: tasks.length,
      byStatus,
      byPriority,
      unassigned,
      byAssignee,
    } as const;
  }, [tasks]);

  const fetchTasks = useCallback(async (teamId: string, teamMemberIds: string[] | undefined): Promise<void> => {
    if (!teamId) return;
    setLoading(true);
    try {
      // Görevleri ve üyeleri paralel çek
      const take = 50;
      const [tasksRes, membersInfo] = await Promise.all([
        taskService.getRecentTasks(teamId, take),
        teamMemberIds && teamMemberIds.length > 0
          ? memberInfoService.getMembersWithInfo(teamId, teamMemberIds)
          : Promise.resolve([]),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data);
        setHasMore(tasksRes.data.length === take);
        const last = tasksRes.data[tasksRes.data.length - 1];
        setLastCreatedAt(last ? last.createdAt : null);
      }
      setMembers(membersInfo as IMemberWithRole[]);
    } finally {
      setLoading(false);
    }
  }, [taskService, memberInfoService]);

  const loadMore = useCallback(async (teamId: string): Promise<void> => {
    if (!teamId || !lastCreatedAt || !hasMore) return;
    setLoading(true);
    try {
      const take = 50;
      const res = await taskService.getRecentTasksBefore(teamId, lastCreatedAt, take);
      if (res.success && res.data.length > 0) {
        setTasks((prev) => [...prev, ...res.data]);
        setHasMore(res.data.length === take);
        const last = res.data[res.data.length - 1];
        setLastCreatedAt(last.createdAt);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [taskService, lastCreatedAt, hasMore]);

  const createTask = useCallback(async (teamId: string, dto: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    const res = await taskService.createTask({
      teamId,
      title: dto.title,
      description: dto.description,
      assignedTo: dto.assignedTo,
      priority: dto.priority,
      status: dto.status,
    });
    if (res.success && res.data) {
      // Optimistik ekleme
      setTasks((prev: ITask[]): ITask[] => [res.data as ITask, ...prev]);
      return true;
    }
    return false;
  }, [taskService]);

  const updateTask = useCallback(async (teamId: string, id: string, updates: Partial<ITask>): Promise<boolean> => {
    const res = await taskService.updateTask(teamId, id, updates);
    if (res.success && res.data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t)));
      return true;
    }
    return false;
  }, [taskService]);

  const deleteTask = useCallback(async (teamId: string, id: string): Promise<boolean> => {
    const res = await taskService.deleteTask(teamId, id);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    }
    return false;
  }, [taskService]);

  return {
    tasks,
    filteredTasks,
    members,
    membersMap,
    loading,
    hasMore,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    selectedWeek,
    setSelectedWeek,
    fetchTasks,
    loadMore,
    createTask,
    updateTask,
    deleteTask,
    counts,
  };
};


