import { useState, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ITeam } from '../../models/Team.model';
import { getTeamNoteService, getTeamTodoService } from '../../di/container';
import { ITeamNote, ITeamTodo } from '../../models/TeamRepository.model';
import { useRepositories } from '../../hooks/useRepositories';
import { useModal } from '../../hooks/useModal';
import { useClipboard } from '../../hooks/useClipboard';
import { useForm } from '../../hooks/useForm';
import { RepositoryHeader } from '../repository/RepositoryHeader';
import { RepositoryTabs } from '../repository/RepositoryTabs';
import { NoteForm } from '../note/NoteForm';
import { TodoForm } from '../todo/TodoForm';
import { NoteSearch } from '../note/NoteSearch';
import { TodoSearch } from '../todo/TodoSearch';
import { NoteFilters } from '../note/NoteFilters';
import { TodoFilters } from '../todo/TodoFilters';
import { NoteList } from '../note/NoteList';
import { TodoList } from '../todo/TodoList';
import { NoteEditModal } from '../note/NoteEditModal';
import { TodoEditModal } from '../todo/TodoEditModal';
import { RepositoryPermissionWarning } from '../repository/RepositoryPermissionWarning';

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
    getUserName,
  } = useRepositories(selectedTeam, userTeams);

  const [editingNote, setEditingNote] = useState<ITeamNote | null>(null);
  const [editingTodo, setEditingTodo] = useState<ITeamTodo | null>(null);

  const editNoteForm = useForm({
    title: '',
    content: '',
    category: '',
    isPinned: false,
  });
  const editTodoForm = useForm({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    completed: false,
  });

  const noteFormModal = useModal(false);
  const todoFormModal = useModal(false);
  const noteEditModal = useModal(false);
  const todoEditModal = useModal(false);
  const noteFiltersModal = useModal(false);
  const todoFiltersModal = useModal(false);

  const noteForm = useForm({ title: '', content: '', category: '' });
  const todoForm = useForm({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
  });

  const { copy: copyToClipboard } = useClipboard();

  const canCreateRepository = hasPermission('CREATE_REPOSITORY');
  const canEditRepository = hasPermission('EDIT_REPOSITORY');
  const canDeleteRepository = hasPermission('DELETE_REPOSITORY');
  const canViewTeamId = hasPermission('VIEW_TEAM_ID');

  const noteService = getTeamNoteService();
  const todoService = getTeamTodoService();

  const handleCopyTeamId = useCallback(async (teamId: string): Promise<void> => {
    const success = await copyToClipboard(teamId);
    if (success) {
      alert('Takım ID kopyalandı!');
    } else {
      alert('Kopyalama başarısız oldu');
    }
  }, [copyToClipboard]);

  const handleCreateNote = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !noteForm.formData.title.trim()) {
      return;
    }

    const result = await noteService.createNote(selectedTeam, user.uid, noteForm.formData);
    if (result.success) {
      noteForm.reset();
      noteFormModal.close();
      await fetchData();
    }
  }, [user, selectedTeam, noteForm, noteService, noteFormModal, fetchData]);

  const handleCreateTodo = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !todoForm.formData.title.trim()) {
      return;
    }

    const result = await todoService.createTodo(selectedTeam, user.uid, {
      ...todoForm.formData,
      assignedTo: todoForm.formData.assignedTo || undefined,
    });
    if (result.success) {
      todoForm.reset();
      todoFormModal.close();
      await fetchData();
    }
  }, [user, selectedTeam, todoForm, todoService, todoFormModal, fetchData]);

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
      title: editNoteForm.formData.title,
      content: editNoteForm.formData.content,
      category: editNoteForm.formData.category,
      isPinned: editNoteForm.formData.isPinned,
    });

    if (result.success) {
      setEditingNote(null);
      editNoteForm.reset();
      noteEditModal.close();
      await fetchData();
    }
  }, [user, selectedTeam, editingNote, editNoteForm, noteService, noteEditModal, fetchData]);

  const handleUpdateTodo = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !editingTodo) {
      return;
    }

    const result = await todoService.updateTodo(selectedTeam, editingTodo.id, user.uid, {
      title: editTodoForm.formData.title,
      description: editTodoForm.formData.description,
      priority: editTodoForm.formData.priority,
      completed: editTodoForm.formData.completed,
    });

    if (result.success) {
      setEditingTodo(null);
      editTodoForm.reset();
      todoEditModal.close();
      await fetchData();
    }
  }, [user, selectedTeam, editingTodo, editTodoForm, todoService, todoEditModal, fetchData]);

  const startEditNote = useCallback((note: ITeamNote): void => {
    setEditingNote(note);
    editNoteForm.setInitialData({
      title: note.title,
      content: note.content,
      category: note.category || '',
      isPinned: note.isPinned,
    });
    noteEditModal.open();
  }, [editNoteForm, noteEditModal]);

  const startEditTodo = useCallback((todo: ITeamTodo): void => {
    setEditingTodo(todo);
    editTodoForm.setInitialData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      completed: todo.completed,
    });
    todoEditModal.open();
  }, [editTodoForm, todoEditModal]);

  const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

  return (
    <div>
      <div className='flex gap-x-4'>
        <div className='flex flex-col gap-y-4'>
          <RepositoryHeader
            userTeams={userTeams}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
            selectedTeamData={selectedTeamData}
            canViewTeamId={canViewTeamId}
            onCopyTeamId={handleCopyTeamId}
          />
          <RepositoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'notes' && (
          <div>
            <RepositoryPermissionWarning canCreateRepository={canCreateRepository} type="note" />

            <div
              className={`flex flex-col sm:flex-row gap-x-2.5 sm:items-center ${noteFormModal.isOpen ? 'flex-wrap' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <NoteSearch searchQuery={noteSearchQuery} onSearchChange={setNoteSearchQuery} />
              </div>
              <button
                onClick={noteFiltersModal.open}
                className="flex-shrink-0 px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all font-medium"
              >
                Filtreler
              </button>
              {canCreateRepository && (
                <div
                  className={`${noteFormModal.isOpen ? 'w-full' : ''}`}
                >
                  <NoteForm
                    showForm={noteFormModal.isOpen}
                    formData={noteForm.formData}
                    onFormChange={noteForm.setFormData}
                    onShowForm={noteFormModal.toggle}
                    onSubmit={handleCreateNote}
                    onCancel={() => {
                      noteFormModal.close();
                      noteForm.reset();
                    }}
                  />
                </div>
              )}
            </div>

            {noteFiltersModal.isOpen && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
                <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-glow-lg border border-indigo-500/20 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Filtreler
                    </h3>
                    <button
                      onClick={noteFiltersModal.close}
                      className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                    >
                      ✕
                    </button>
                  </div>
                  <NoteFilters
                    filter={noteFilter}
                    members={members}
                    onFilterChange={setNoteFilter}
                  />
                  <div className="mt-4">
                    <button
                      onClick={noteFiltersModal.close}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              </div>
            )}

            <NoteList
              notes={filteredNotes}
              loading={loading}
              getUserName={getUserName}
              canEditRepository={canEditRepository}
              canDeleteRepository={canDeleteRepository}
              onEdit={startEditNote}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteNote}
            />
          </div>
        )}

        {activeTab === 'todos' && (
          <div className='w-full'>
            <RepositoryPermissionWarning canCreateRepository={canCreateRepository} type="todo" />
            <div
              className={`flex flex-col sm:flex-row gap-x-2.5 sm:items-center ${noteFormModal.isOpen ? 'flex-wrap' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <TodoSearch searchQuery={todoSearchQuery} onSearchChange={setTodoSearchQuery} />
              </div>
              <button
                onClick={todoFiltersModal.open}
                className="flex-shrink-0 px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all font-medium"
              >
                Filtreler
              </button>
              {canCreateRepository && (
                <div className={`${todoFormModal.isOpen ? 'w-full' : ''}`}>
                  <TodoForm
                    showForm={todoFormModal.isOpen}
                    formData={todoForm.formData}
                    members={members}
                    onFormChange={todoForm.setFormData}
                    onShowForm={todoFormModal.toggle}
                    onSubmit={handleCreateTodo}
                    onCancel={() => {
                      todoFormModal.close();
                      todoForm.reset();
                    }}
                  />
                </div>
              )}
            </div>

            {todoFiltersModal.isOpen && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
                <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-glow-lg border border-indigo-500/20 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Filtreler
                    </h3>
                    <button
                      onClick={todoFiltersModal.close}
                      className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                    >
                      ✕
                    </button>
                  </div>
                  <TodoFilters
                    filter={todoFilter}
                    members={members}
                    onFilterChange={setTodoFilter}
                  />
                  <div className="mt-4">
                    <button
                      onClick={todoFiltersModal.close}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              </div>
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
      </div>

      {/* Edit Modals */}
      <NoteEditModal
        isOpen={noteEditModal.isOpen}
        formData={editNoteForm.formData}
        onFormChange={editNoteForm.setFormData}
        onClose={() => {
          setEditingNote(null);
          editNoteForm.reset();
          noteEditModal.close();
        }}
        onSave={handleUpdateNote}
      />

      <TodoEditModal
        isOpen={todoEditModal.isOpen}
        formData={editTodoForm.formData}
        onFormChange={editTodoForm.setFormData}
        onClose={() => {
          setEditingTodo(null);
          editTodoForm.reset();
          todoEditModal.close();
        }}
        onSave={handleUpdateTodo}
      />
    </div>
  );
};
