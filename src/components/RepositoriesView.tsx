import { useState, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ITeam } from '../models/Team.model';
import { getTeamNoteService, getTeamTodoService } from '../di/container';
import { ITeamNote, ITeamTodo } from '../models/TeamRepository.model';
import { useRepositories } from '../hooks/useRepositories';
import { RepositoryHeader } from './RepositoryHeader';
import { RepositoryTabs } from './RepositoryTabs';
import { NoteForm } from './NoteForm';
import { TodoForm } from './TodoForm';
import { NoteSearch } from './NoteSearch';
import { TodoSearch } from './TodoSearch';
import { NoteFilters } from './NoteFilters';
import { TodoFilters } from './TodoFilters';
import { NoteList } from './NoteList';
import { TodoList } from './TodoList';
import { NoteEditModal } from './NoteEditModal';
import { TodoEditModal } from './TodoEditModal';
import { RepositoryPermissionWarning } from './RepositoryPermissionWarning';

interface RepositoriesViewProps {
  userTeams: ITeam[];
}

/**
 * RepositoriesView Component
 * SOLID: Single Responsibility - Sadece component composition'ından sorumlu
 * Composition Pattern - Küçük componentleri birleştirir
 */
export const RepositoriesView = ({ userTeams }: RepositoriesViewProps): JSX.Element => {
  const { user } = useAuthContext();
  const [selectedTeam, setSelectedTeam] = useState<string>(userTeams[0]?.id || '');
  const { hasPermission } = usePermissions(selectedTeam);
  const {
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
    loadMore,
    getUserName,
  } = useRepositories(selectedTeam, userTeams);

  const [editingNote, setEditingNote] = useState<ITeamNote | null>(null);
  const [editingTodo, setEditingTodo] = useState<ITeamTodo | null>(null);
  const [editNoteForm, setEditNoteForm] = useState({
    title: '',
    content: '',
    category: '',
    isPinned: false,
  });
  const [editTodoForm, setEditTodoForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    completed: false,
  });
  const [showNoteForm, setShowNoteForm] = useState<boolean>(false);
  const [showTodoForm, setShowTodoForm] = useState<boolean>(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: '' });
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
  });

  const canCreateRepository = hasPermission('CREATE_REPOSITORY');
  const canEditRepository = hasPermission('EDIT_REPOSITORY');
  const canDeleteRepository = hasPermission('DELETE_REPOSITORY');
  const canViewTeamId = hasPermission('VIEW_TEAM_ID');

  const noteService = getTeamNoteService();
  const todoService = getTeamTodoService();

  const handleCopyTeamId = useCallback(async (teamId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(teamId);
      alert('Takım ID kopyalandı!');
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      alert('Kopyalama başarısız oldu');
    }
  }, []);

  const handleCreateNote = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !noteForm.title.trim()) {
      return;
    }

    const result = await noteService.createNote(selectedTeam, user.uid, noteForm);
    if (result.success) {
      setNoteForm({ title: '', content: '', category: '' });
      setShowNoteForm(false);
      await fetchData();
    }
  }, [user, selectedTeam, noteForm, noteService, fetchData]);

  const handleCreateTodo = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !todoForm.title.trim()) {
      return;
    }

    const result = await todoService.createTodo(selectedTeam, user.uid, {
      ...todoForm,
      assignedTo: todoForm.assignedTo || undefined,
    });
    if (result.success) {
      setTodoForm({ title: '', description: '', priority: 'medium', assignedTo: '' });
      setShowTodoForm(false);
      await fetchData();
    }
  }, [user, selectedTeam, todoForm, todoService, fetchData]);

  const handleToggleTodo = useCallback(
    async (id: string): Promise<void> => {
      if (!user || !selectedTeam) {
        return;
      }
      await todoService.toggleComplete(selectedTeam, id, user.uid);
      await fetchData();
    },
    [user, selectedTeam, todoService, fetchData]
  );

  const handleDeleteNote = useCallback(
    async (id: string): Promise<void> => {
      if (!user || !selectedTeam || !window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
        return;
      }
      await noteService.deleteNote(selectedTeam, id, user.uid);
      await fetchData();
    },
    [user, selectedTeam, noteService, fetchData]
  );

  const handleDeleteTodo = useCallback(
    async (id: string): Promise<void> => {
      if (
        !user ||
        !selectedTeam ||
        !window.confirm("Bu todo'yu silmek istediğinize emin misiniz?")
      ) {
        return;
      }
      await todoService.deleteTodo(selectedTeam, id, user.uid);
      await fetchData();
    },
    [user, selectedTeam, todoService, fetchData]
  );

  const handleTogglePin = useCallback(
    async (id: string): Promise<void> => {
      if (!user || !selectedTeam) {
        return;
      }

      // Mevcut sabitlenmiş notları say
      const pinnedCount = filteredNotes.filter((note) => note.isPinned).length;
      const noteToToggle = filteredNotes.find((note) => note.id === id);

      // Sabitlemek istiyorsa ve 3'ten fazla sabitli not varsa uyarı ver
      if (!noteToToggle?.isPinned && pinnedCount >= 3) {
        alert('En fazla 3 not sabitlenebilir. Lütfen önce bir sabitlenmiş notu çözün.');
        return;
      }

      await noteService.togglePin(selectedTeam, id, user.uid);
      await fetchData();
    },
    [user, selectedTeam, filteredNotes, noteService, fetchData]
  );

  const handleUpdateNote = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !editingNote) {
      return;
    }

    const result = await noteService.updateNote(selectedTeam, editingNote.id, user.uid, {
      title: editNoteForm.title,
      content: editNoteForm.content,
      category: editNoteForm.category,
      isPinned: editNoteForm.isPinned,
    });

    if (result.success) {
      setEditingNote(null);
      setEditNoteForm({ title: '', content: '', category: '', isPinned: false });
      await fetchData();
    }
  }, [user, selectedTeam, editingNote, editNoteForm, noteService, fetchData]);

  const handleUpdateTodo = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !editingTodo) {
      return;
    }

    const result = await todoService.updateTodo(selectedTeam, editingTodo.id, user.uid, {
      title: editTodoForm.title,
      description: editTodoForm.description,
      priority: editTodoForm.priority,
      completed: editTodoForm.completed,
    });

    if (result.success) {
      setEditingTodo(null);
      setEditTodoForm({ title: '', description: '', priority: 'medium', completed: false });
      await fetchData();
    }
  }, [user, selectedTeam, editingTodo, editTodoForm, todoService, fetchData]);

  const startEditNote = useCallback((note: ITeamNote): void => {
    setEditingNote(note);
    setEditNoteForm({
      title: note.title,
      content: note.content,
      category: note.category || '',
      isPinned: note.isPinned,
    });
  }, []);

  const startEditTodo = useCallback((todo: ITeamTodo): void => {
    setEditingTodo(todo);
    setEditTodoForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      completed: todo.completed,
    });
  }, []);

  const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

  return (
    <div>
      <RepositoryHeader
        userTeams={userTeams}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        selectedTeamData={selectedTeamData}
        canViewTeamId={canViewTeamId}
        onCopyTeamId={handleCopyTeamId}
      />

      <RepositoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div>
          <RepositoryPermissionWarning canCreateRepository={canCreateRepository} type="note" />

          {canCreateRepository && (
            <NoteForm
              showForm={showNoteForm}
              formData={noteForm}
              onFormChange={setNoteForm}
              onShowForm={setShowNoteForm}
              onSubmit={handleCreateNote}
              onCancel={() => {
                setShowNoteForm(false);
                setNoteForm({ title: '', content: '', category: '' });
              }}
            />
          )}

          <NoteSearch searchQuery={noteSearchQuery} onSearchChange={setNoteSearchQuery} />

          <NoteFilters filter={noteFilter} members={members} onFilterChange={setNoteFilter} />

          <NoteList
            notes={filteredNotes}
            loading={loading}
            getUserName={getUserName}
            canEditRepository={canEditRepository}
            canDeleteRepository={canDeleteRepository}
            onEdit={startEditNote}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteNote}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      )}

      {/* Todos Tab */}
      {activeTab === 'todos' && (
        <div>
          <TodoSearch searchQuery={todoSearchQuery} onSearchChange={setTodoSearchQuery} />

          <TodoFilters filter={todoFilter} members={members} onFilterChange={setTodoFilter} />

          <RepositoryPermissionWarning canCreateRepository={canCreateRepository} type="todo" />

          {canCreateRepository && (
            <TodoForm
              showForm={showTodoForm}
              formData={todoForm}
              members={members}
              onFormChange={setTodoForm}
              onShowForm={setShowTodoForm}
              onSubmit={handleCreateTodo}
              onCancel={() => {
                setShowTodoForm(false);
                setTodoForm({ title: '', description: '', priority: 'medium', assignedTo: '' });
              }}
            />
          )}

          <TodoList
            todos={filteredTodos}
            loading={loading}
            getUserName={getUserName}
            canEditRepository={canEditRepository}
            canDeleteRepository={canDeleteRepository}
            onToggleComplete={handleToggleTodo}
            onEdit={startEditTodo}
            onDelete={handleDeleteTodo}
          />
        </div>
      )}

      {/* Edit Modals */}
      <NoteEditModal
        isOpen={editingNote !== null}
        formData={editNoteForm}
        onFormChange={setEditNoteForm}
        onClose={() => {
          setEditingNote(null);
          setEditNoteForm({ title: '', content: '', category: '', isPinned: false });
        }}
        onSave={handleUpdateNote}
      />

      <TodoEditModal
        isOpen={editingTodo !== null}
        formData={editTodoForm}
        onFormChange={setEditTodoForm}
        onClose={() => {
          setEditingTodo(null);
          setEditTodoForm({ title: '', description: '', priority: 'medium', completed: false });
        }}
        onSave={handleUpdateTodo}
      />
    </div>
  );
};
