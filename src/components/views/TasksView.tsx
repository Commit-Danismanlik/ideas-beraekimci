import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ITeam } from '../../models/Team.model';
import { ITask } from '../../models/Task.model';
import { TaskModal } from './TaskModal';
import { useTasks } from '../../hooks/useTasks';
import { TaskHeader } from '../common/TaskHeader';
import { TaskSearch } from '../common/TaskSearch';
import { TaskFilters } from '../common/TaskFilters';
import { TaskForm } from '../common/TaskForm';
import { TaskList } from '../common/TaskList';
import { TaskPermissionWarning } from '../common/TaskPermissionWarning';

interface TasksViewProps {
  userTeams: ITeam[];
}

/**
 * TasksView Component
 * SOLID: Single Responsibility - Sadece component composition'ından sorumlu
 * Composition Pattern - Küçük componentleri birleştirir
 */
export const TasksView = ({ userTeams }: TasksViewProps): JSX.Element => {
  const { user } = useAuthContext();
  const [selectedTeam, setSelectedTeam] = useState<string>(userTeams[0]?.id || '');
  const { hasPermission } = usePermissions(selectedTeam);
  const {
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
  } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in-progress' | 'done',
  });

  const canCreateTask = hasPermission('CREATE_TASK');
  const canDeleteTask = hasPermission('DELETE_TASK');
  const canViewTeamId = hasPermission('VIEW_TEAM_ID');

  const handleCopyTeamId = useCallback(async (teamId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(teamId);
      alert('Takım ID kopyalandı!');
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      alert('Kopyalama başarısız oldu');
    }
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      const team = userTeams.find((t) => t.id === selectedTeam);
      if (team) {
        fetchTasks(selectedTeam, team.members);
      }
    }
  }, [selectedTeam, userTeams, fetchTasks]);

  const handleCreateTask = useCallback(async (): Promise<void> => {
    if (!user || !selectedTeam || !taskForm.title.trim()) {
      return;
    }
    const ok = await createTask(selectedTeam, {
      title: taskForm.title,
      description: taskForm.description || undefined,
      assignedTo: taskForm.assignedTo || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
    });
    if (ok) {
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        status: 'todo',
      });
      setShowTaskForm(false);
    }
  }, [user, selectedTeam, taskForm, createTask]);

  const handleDeleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!selectedTeam || !window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
        return;
      }
      await deleteTask(selectedTeam, id);
    },
    [selectedTeam, deleteTask]
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: Partial<ITask>): Promise<void> => {
      if (!selectedTeam) {
        return;
      }
      await updateTask(selectedTeam, taskId, updates);
    },
    [selectedTeam, updateTask]
  );

  const handleClearFilters = useCallback((): void => {
    setFilters({ status: 'all', priority: 'all', assignedTo: 'all' });
    setSelectedWeek(null);
  }, [setFilters, setSelectedWeek]);

  const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

  return (
    <div>
      <TaskHeader
        userTeams={userTeams}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        selectedTeamData={selectedTeamData}
        canViewTeamId={canViewTeamId}
        onCopyTeamId={handleCopyTeamId}
      />

      <TaskSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <TaskFilters
        filters={filters}
        counts={counts}
        members={members}
        selectedWeek={selectedWeek}
        onFiltersChange={setFilters}
        onWeekSelect={setSelectedWeek}
        onClearFilters={handleClearFilters}
        filteredCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      <TaskPermissionWarning canCreateTask={canCreateTask} />

      {canCreateTask && (
        <TaskForm
          showForm={showTaskForm}
          formData={taskForm}
          members={members}
          onFormChange={setTaskForm}
          onShowForm={setShowTaskForm}
          onSubmit={handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false);
            setTaskForm({
              title: '',
              description: '',
              assignedTo: '',
              priority: 'medium',
              status: 'todo',
            });
          }}
        />
      )}

      <TaskList
        tasks={tasks}
        filteredTasks={filteredTasks}
        membersMap={membersMap}
        loading={loading}
        canDeleteTask={canDeleteTask}
        onTaskClick={setSelectedTask}
        onDeleteTask={handleDeleteTask}
        hasMore={hasMore}
        onLoadMore={() => loadMore(selectedTeam)}
      />

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          teamId={selectedTeam}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};
