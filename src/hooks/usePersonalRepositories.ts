import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getPersonalNoteService, getPersonalTodoService } from '../di/container';
import { IPersonalNote, IPersonalTodo, ICreateNoteDto, ICreateTodoDto } from '../models/PersonalRepository.model';
import { useModal } from './useModal';
import { useForm } from './useForm';
import { useSearch } from './useSearch';

type TabType = 'notes' | 'todos';

interface INoteFormData extends Record<string, unknown> {
  title: string;
  content: string;
  category: string;
}

interface ITodoFormData extends Record<string, unknown> {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UsePersonalRepositoriesReturn {
  // Tab
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Notes
  notes: IPersonalNote[];
  filteredNotes: IPersonalNote[];
  noteSearchQuery: string;
  setNoteSearchQuery: (query: string) => void;
  showNoteForm: boolean;
  noteForm: INoteFormData;
  setNoteForm: (data: INoteFormData | ((prev: INoteFormData) => INoteFormData)) => void;
  openNoteForm: () => void;
  closeNoteForm: () => void;

  // Todos
  todos: IPersonalTodo[];
  filteredTodos: IPersonalTodo[];
  todoSearchQuery: string;
  setTodoSearchQuery: (query: string) => void;
  showTodoForm: boolean;
  todoForm: ITodoFormData;
  setTodoForm: (data: ITodoFormData | ((prev: ITodoFormData) => ITodoFormData)) => void;
  openTodoForm: () => void;
  closeTodoForm: () => void;

  // Loading
  loading: boolean;

  // Actions
  handleCreateNote: () => Promise<void>;
  handleCreateTodo: () => Promise<void>;
  handleToggleTodo: (id: string) => Promise<void>;
  handleDeleteNote: (id: string) => Promise<void>;
  handleDeleteTodo: (id: string) => Promise<void>;
  handleTogglePin: (id: string) => Promise<void>;
  fetchData: () => Promise<void>;
}

/**
 * usePersonalRepositories Hook
 * Personal repositories (notes ve todos) yönetimi için
 * SOLID: Single Responsibility - Sadece personal repositories state ve logic'inden sorumlu
 */
export const usePersonalRepositories = (): UsePersonalRepositoriesReturn => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [notes, setNotes] = useState<IPersonalNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<IPersonalNote[]>([]);
  const [todos, setTodos] = useState<IPersonalTodo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<IPersonalTodo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modals
  const noteFormModal = useModal(false);
  const todoFormModal = useModal(false);

  // Forms
  const noteForm = useForm<INoteFormData>({ title: '', content: '', category: '' });
  const todoForm = useForm<ITodoFormData>({ title: '', description: '', priority: 'medium' });

  // Search
  const noteSearch = useSearch();
  const todoSearch = useSearch();

  const noteService = getPersonalNoteService();
  const todoService = getPersonalTodoService();

  // Fetch data
  const fetchData = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    if (activeTab === 'notes') {
      const result = await noteService.getUserNotes(user.uid);
      if (result.success) {
        setNotes(result.data);
      }
    } else {
      const result = await todoService.getUserTodos(user.uid);
      if (result.success) {
        setTodos(result.data);
      }
    }
    setLoading(false);
  }, [user, activeTab, noteService, todoService]);

  // Filter notes
  useEffect(() => {
    if (activeTab === 'notes') {
      let filtered = [...notes];
      
      // Arama filtresini uygula
      if (noteSearch.searchQuery.trim()) {
        filtered = filtered.filter(note =>
          note.title.toLowerCase().includes(noteSearch.searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(noteSearch.searchQuery.toLowerCase()) ||
          note.category?.toLowerCase().includes(noteSearch.searchQuery.toLowerCase())
        );
      }

      // Sabitlenmiş notları en başa taşı
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });

      setFilteredNotes(filtered);
    }
  }, [notes, noteSearch.searchQuery, activeTab]);

  // Filter todos
  useEffect(() => {
    if (activeTab === 'todos') {
      let filtered = [...todos];
      
      // Arama filtresini uygula
      if (todoSearch.searchQuery.trim()) {
        filtered = filtered.filter(todo =>
          todo.title.toLowerCase().includes(todoSearch.searchQuery.toLowerCase()) ||
          todo.description?.toLowerCase().includes(todoSearch.searchQuery.toLowerCase())
        );
      }
      
      setFilteredTodos(filtered);
    }
  }, [todos, todoSearch.searchQuery, activeTab]);

  // Tab değiştiğinde search query'i temizle
  useEffect(() => {
    noteSearch.clearSearch();
    todoSearch.clearSearch();
  }, [activeTab]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab, fetchData]);

  // Create Note
  const handleCreateNote = useCallback(async (): Promise<void> => {
    if (!user || !noteForm.formData.title.trim()) return;

    const dto: ICreateNoteDto = {
      title: noteForm.formData.title,
      content: noteForm.formData.content,
      category: noteForm.formData.category || undefined,
    };

    const result = await noteService.createNote(user.uid, dto);
    if (result.success) {
      noteForm.reset();
      noteFormModal.close();
      await fetchData();
    }
  }, [user, noteForm, noteService, noteFormModal, fetchData]);

  // Create Todo
  const handleCreateTodo = useCallback(async (): Promise<void> => {
    if (!user || !todoForm.formData.title.trim()) return;

    const dto: ICreateTodoDto = {
      title: todoForm.formData.title,
      description: todoForm.formData.description || undefined,
      priority: todoForm.formData.priority,
    };

    const result = await todoService.createTodo(user.uid, dto);
    if (result.success) {
      todoForm.reset();
      todoFormModal.close();
      await fetchData();
    }
  }, [user, todoForm, todoService, todoFormModal, fetchData]);

  // Toggle Todo
  const handleToggleTodo = useCallback(async (id: string): Promise<void> => {
    await todoService.toggleComplete(id);
    await fetchData();
  }, [todoService, fetchData]);

  // Delete Note
  const handleDeleteNote = useCallback(async (id: string): Promise<void> => {
    if (window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
      await noteService.deleteNote(id);
      await fetchData();
    }
  }, [noteService, fetchData]);

  // Delete Todo
  const handleDeleteTodo = useCallback(async (id: string): Promise<void> => {
    if (window.confirm("Bu todo'yu silmek istediğinize emin misiniz?")) {
      await todoService.deleteTodo(id);
      await fetchData();
    }
  }, [todoService, fetchData]);

  // Toggle Pin
  const handleTogglePin = useCallback(async (id: string): Promise<void> => {
    // Mevcut sabitlenmiş notları say
    const pinnedCount = notes.filter(note => note.isPinned).length;
    const noteToToggle = notes.find(note => note.id === id);

    // Sabitlemek istiyorsa ve 3'ten fazla sabitli not varsa uyarı ver
    if (!noteToToggle?.isPinned && pinnedCount >= 3) {
      alert('En fazla 3 not sabitlenebilir. Lütfen önce bir sabitlenmiş notu çözün.');
      return;
    }

    await noteService.togglePin(id);
    await fetchData();
  }, [notes, noteService, fetchData]);

  return {
    // Tab
    activeTab,
    setActiveTab,

    // Notes
    notes,
    filteredNotes,
    noteSearchQuery: noteSearch.searchQuery,
    setNoteSearchQuery: noteSearch.setSearchQuery,
    showNoteForm: noteFormModal.isOpen,
    noteForm: noteForm.formData,
    setNoteForm: noteForm.setFormData,
    openNoteForm: noteFormModal.open,
    closeNoteForm: noteFormModal.close,

    // Todos
    todos,
    filteredTodos,
    todoSearchQuery: todoSearch.searchQuery,
    setTodoSearchQuery: todoSearch.setSearchQuery,
    showTodoForm: todoFormModal.isOpen,
    todoForm: todoForm.formData,
    setTodoForm: todoForm.setFormData,
    openTodoForm: todoFormModal.open,
    closeTodoForm: todoFormModal.close,

    // Loading
    loading,

    // Actions
    handleCreateNote,
    handleCreateTodo,
    handleToggleTodo,
    handleDeleteNote,
    handleDeleteTodo,
    handleTogglePin,
    fetchData,
  };
};

