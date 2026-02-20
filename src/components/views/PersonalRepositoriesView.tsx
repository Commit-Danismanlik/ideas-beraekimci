import { useState, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePersonalRepositories } from '../../hooks/usePersonalRepositories';
import { getPersonalNoteService, getPersonalTodoService } from '../../di/container';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import { IPersonalNote, IPersonalTodo } from '../../models/PersonalRepository.model';
import { RepositoryTabs } from '../repository/RepositoryTabs';
import { NoteForm } from '../note/NoteForm';
import { TodoForm } from '../todo/TodoForm';
import { NoteSearch } from '../note/NoteSearch';
import { TodoSearch } from '../todo/TodoSearch';
import { NoteList } from '../note/NoteList';
import { TodoList } from '../todo/TodoList';
import { NoteEditModal } from '../note/NoteEditModal';
import { TodoEditModal } from '../todo/TodoEditModal';

/**
 * PersonalRepositoriesView Component
 * RepositoriesView ile tasarımsal olarak aynı yapıda
 * SOLID: Single Responsibility - Component composition'ından sorumlu
 */
export const PersonalRepositoriesView = (): JSX.Element => {
  const { user } = useAuthContext();
  const {
    activeTab,
    setActiveTab,
    filteredNotes,
    noteSearchQuery,
    setNoteSearchQuery,
    showNoteForm,
    noteForm,
    setNoteForm,
    openNoteForm,
    closeNoteForm,
    filteredTodos,
    todoSearchQuery,
    setTodoSearchQuery,
    showTodoForm,
    todoForm,
    setTodoForm,
    openTodoForm,
    closeTodoForm,
    loading,
    handleCreateNote,
    handleCreateTodo,
    handleToggleTodo,
    handleDeleteNote,
    handleDeleteTodo,
    handleTogglePin,
    fetchData,
  } = usePersonalRepositories();

  const [editingNote, setEditingNote] = useState<IPersonalNote | null>(null);
  const [editingTodo, setEditingTodo] = useState<IPersonalTodo | null>(null);

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

  const noteEditModal = useModal(false);
  const todoEditModal = useModal(false);

  const noteService = getPersonalNoteService();
  const todoService = getPersonalTodoService();

  const getUserName = useCallback(
    (userId: string): string => {
      if (user && userId === user.uid) {
        return user.displayName || user.email || 'Sen';
      }
      return 'Sen';
    },
    [user]
  );

  const handleUpdateNote = useCallback(async (): Promise<void> => {
    if (!user || !editingNote) return;

    const result = await noteService.updateNote(editingNote.id, {
      title: editNoteForm.formData.title,
      content: editNoteForm.formData.content,
      category: editNoteForm.formData.category || undefined,
      isPinned: editNoteForm.formData.isPinned,
    });

    if (result.success) {
      setEditingNote(null);
      editNoteForm.reset();
      noteEditModal.close();
      await fetchData();
    }
  }, [user, editingNote, editNoteForm, noteService, fetchData]);

  const handleUpdateTodo = useCallback(async (): Promise<void> => {
    if (!user || !editingTodo) return;

    const result = await todoService.updateTodo(editingTodo.id, {
      title: editTodoForm.formData.title,
      description: editTodoForm.formData.description || undefined,
      priority: editTodoForm.formData.priority,
      completed: editTodoForm.formData.completed,
    });

    if (result.success) {
      setEditingTodo(null);
      editTodoForm.reset();
      todoEditModal.close();
      await fetchData();
    }
  }, [user, editingTodo, editTodoForm, todoService, fetchData]);

  const startEditNote = useCallback(
    (note: IPersonalNote): void => {
      setEditingNote(note);
      editNoteForm.setInitialData({
        title: note.title,
        content: note.content,
        category: note.category || '',
        isPinned: note.isPinned,
      });
      noteEditModal.open();
    },
    [editNoteForm]
  );

  const startEditTodo = useCallback(
    (todo: IPersonalTodo): void => {
      setEditingTodo(todo);
      editTodoForm.setInitialData({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        completed: todo.completed,
      });
      todoEditModal.open();
    },
    [editTodoForm]
  );

  const mapNoteToTeamLike = useCallback(
    (note: IPersonalNote) => ({ ...note, createdBy: note.userId }),
    []
  );
  const mapTodoToTeamLike = useCallback(
    (todo: IPersonalTodo) => ({ ...todo, createdBy: todo.userId }),
    []
  );

  const mappedNotes = filteredNotes.map(mapNoteToTeamLike);
  const mappedTodos = filteredTodos.map(mapTodoToTeamLike);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-x-4">
        <div className="flex flex-col gap-y-4 shrink-0 lg:w-auto sm:px-5 px-0">
          <div className="flex flex-col gap-y-2">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent truncate">
              Personal Repositories
            </h2>
          </div>
          <RepositoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'notes' && (
          <div className="w-full min-w-0">
            <div
              className={`flex flex-col sm:flex-row gap-2 sm:gap-x-2.5 sm:items-center ${showNoteForm ? 'flex-wrap' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <NoteSearch searchQuery={noteSearchQuery} onSearchChange={setNoteSearchQuery} />
              </div>
              <div className={showNoteForm ? 'w-full' : ''}>
                <NoteForm
                  showForm={showNoteForm}
                  formData={noteForm}
                  onFormChange={(data) =>
                    setNoteForm({ title: data.title, content: data.content, category: data.category })
                  }
                  onShowForm={(show) => (show ? openNoteForm() : closeNoteForm())}
                  onSubmit={handleCreateNote}
                  onCancel={() => {
                    closeNoteForm();
                    setNoteForm({ title: '', content: '', category: '' });
                  }}
                />
              </div>
            </div>

            <NoteList
              notes={mappedNotes}
              loading={loading}
              getUserName={getUserName}
              canEditRepository={true}
              canDeleteRepository={true}
              onEdit={(note) => startEditNote(filteredNotes.find((n) => n.id === note.id)!)}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteNote}
            />
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="w-full">
            <div
              className={`flex flex-col sm:flex-row gap-2 sm:gap-x-2.5 sm:items-center ${showTodoForm ? 'flex-wrap' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <TodoSearch searchQuery={todoSearchQuery} onSearchChange={setTodoSearchQuery} />
              </div>
              <div className={showTodoForm ? 'w-full' : ''}>
                <TodoForm
                  showForm={showTodoForm}
                  formData={{ ...todoForm, assignedTo: '' }}
                  members={[]}
                  onFormChange={(data) =>
                    setTodoForm({
                      title: data.title,
                      description: data.description,
                      priority: data.priority,
                    })
                  }
                  onShowForm={(show) => (show ? openTodoForm() : closeTodoForm())}
                  onSubmit={handleCreateTodo}
                  onCancel={() => {
                    closeTodoForm();
                    setTodoForm({ title: '', description: '', priority: 'medium' });
                  }}
                />
              </div>
            </div>

            <TodoList
              todos={mappedTodos}
              loading={loading}
              getUserName={getUserName}
              canEditRepository={true}
              canDeleteRepository={true}
              onToggleComplete={handleToggleTodo}
              onEdit={(todo) => startEditTodo(filteredTodos.find((t) => t.id === todo.id)!)}
              onDelete={handleDeleteTodo}
            />
          </div>
        )}
      </div>

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
