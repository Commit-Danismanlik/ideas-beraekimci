import { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ITeam } from '../models/Team.model';
import { ITask } from '../models/Task.model';
 
import { TaskModal } from './TaskModal';
import { useTasks } from '../hooks/useTasks';
import { MemoizedVirtualizedList } from './VirtualizedList';
// PrimeReact Calendar locale hatası nedeniyle kaldırıldı, HTML5 date picker kullanılacak

interface TasksViewProps {
  userTeams: ITeam[];
}

export const TasksView = ({ userTeams }: TasksViewProps) => {
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
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in-progress' | 'done'
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPreviewWeek, setCalendarPreviewWeek] = useState<Date>(new Date());

  

  const canCreateTask = hasPermission('CREATE_TASK');
  const canDeleteTask = hasPermission('DELETE_TASK');
  const canViewTeamId = hasPermission('VIEW_TEAM_ID');

  const handleCopyTeamId = async (teamId: string) => {
    try {
      await navigator.clipboard.writeText(teamId);
      alert('Takım ID kopyalandı!');
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      alert('Kopyalama başarısız oldu');
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      const team = userTeams.find((t) => t.id === selectedTeam);
      fetchTasks(selectedTeam, team?.members);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const getWeekRange = (date: Date): { start: Date; end: Date } => {
    const start = new Date(date);
    // Pazartesi günü hesapla (0 = Pazar, 1 = Pazartesi)
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazartesi'ye göre fark
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // 6 gün sonrası (Pazar)
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  // Counts -> useTasks içinde memoize edildi (counts)

  const handleWeekSelect = (date: Date | null) => {
    setSelectedWeek(date);
    setShowCalendar(false);
  };

  const clearWeekFilter = () => {
    setSelectedWeek(null);
  };

  const getWeekLabel = (date: Date): string => {
    const { start, end } = getWeekRange(date);
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
  };

  // useTasks.fetchTasks kullanılacak

  const handleCreateTask = async () => {
    if (!user || !selectedTeam || !taskForm.title.trim()) return;
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
        status: 'todo'
      });
      setShowTaskForm(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!selectedTeam || !window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    await deleteTask(selectedTeam, id);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ITask>) => {
    if (!selectedTeam) return;
    await updateTask(selectedTeam, taskId, updates);
  };

  const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Görevler</h2>

        {/* Team Selector */}
        {userTeams.length > 1 && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-600"
          >
            {userTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedTeamData && (
        <div className="mb-6 p-4 bg-indigo-950 border border-indigo-900 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-indigo-200">{selectedTeamData.name}</h3>
              <p className="text-sm text-indigo-300">
                {selectedTeamData.description || 'Açıklama yok'}
              </p>
            </div>
            {canViewTeamId && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Takım ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-gray-800 px-2 py-1 rounded border border-indigo-700 text-indigo-300">
                    {selectedTeamData.id}
                  </code>
                  <button
                    onClick={() => handleCopyTeamId(selectedTeamData.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1 rounded border border-gray-300"
                    title="Takım ID'sini kopyala"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Arama */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Arama</h3>
        <input
          type="text"
          placeholder="Task başlığı, açıklama veya atanan kişi ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Filtreler */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as typeof filters.status })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-200"
            >
              <option value="all">Tümü ({counts.total})</option>
              <option value="todo">📝 Yapılacak ({counts.byStatus['todo']})</option>
              <option value="in-progress">⏳ Devam Ediyor ({counts.byStatus['in-progress']})</option>
              <option value="done">✅ Tamamlanan ({counts.byStatus['done']})</option>
            </select>
          </div>

          {/* Priority Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Öncelik</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as typeof filters.priority })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-200"
            >
              <option value="all">Tümü</option>
              <option value="high">🔴 Yüksek ({counts.byPriority['high']})</option>
              <option value="medium">🟡 Orta ({counts.byPriority['medium']})</option>
              <option value="low">⚪ Düşük ({counts.byPriority['low']})</option>
            </select>
          </div>

          {/* Atanan Kişi Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Atanan Kişi</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-200"
            >
              <option value="all">Tümü</option>
              <option value="unassigned">Atanmamış ({counts.unassigned})</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName || member.email} ({counts.byAssignee[member.userId] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Tarih Filtresi - Haftalık */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Haftalık Tarih</label>
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-left text-gray-200 hover:bg-gray-800 flex items-center justify-between"
              >
                <span>
                  {selectedWeek ? getWeekLabel(selectedWeek) : '📅 Hafta Seç'}
                </span>
                <span className="text-gray-400">▼</span>
              </button>

              {showCalendar && (
                <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 w-80">
                  {/* Basit hafta seçici */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Pzt</div>
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Sal</div>
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Çar</div>
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Per</div>
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Cum</div>
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Cmt</div>
                    <div className="text-xs font-semibold text-center text-gray-400 p-2">Paz</div>
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = new Date(calendarPreviewWeek);
                      date.setDate(calendarPreviewWeek.getDate() - 7 + i);
                      const { start: weekStart, end: weekEnd } = getWeekRange(calendarPreviewWeek);
                      const isInSelectedWeek = date >= weekStart && date <= weekEnd;
                      const isSelected = isInSelectedWeek;

                      return (
                        <button
                          key={i}
                          onClick={() => handleWeekSelect(date)}
                          className={`text-xs p-2 rounded ${isSelected
                              ? 'bg-indigo-700 text-white font-semibold'
                              : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation butonları */}
                  <div className="flex gap-1 mb-2">
                    <button
                      onClick={() => {
                        const prev = new Date(calendarPreviewWeek);
                        prev.setDate(prev.getDate() - 7);
                        setCalendarPreviewWeek(prev);
                      }}
                      className="flex-1 text-xs bg-gray-700 text-gray-200 py-2 rounded hover:bg-gray-600"
                    >
                      ← Önceki Hafta
                    </button>
                    <button
                      onClick={() => {
                        const next = new Date(calendarPreviewWeek);
                        next.setDate(next.getDate() + 7);
                        setCalendarPreviewWeek(next);
                      }}
                      className="flex-1 text-xs bg-gray-700 text-gray-200 py-2 rounded hover:bg-gray-600"
                    >
                      Sonraki Hafta →
                    </button>
                  </div>

                  {/* Hızlı seçim butonları */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => {
                        const today = new Date();
                        setCalendarPreviewWeek(today);
                        handleWeekSelect(today);
                      }}
                      className="flex-1 text-xs bg-indigo-700 text-white py-2 rounded hover:bg-indigo-800"
                    >
                      📅 Bu Hafta
                    </button>
                    <button
                      onClick={() => {
                        const lastWeek = new Date();
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        setCalendarPreviewWeek(lastWeek);
                        handleWeekSelect(lastWeek);
                      }}
                      className="flex-1 text-xs bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                    >
                      ← Geçen Hafta
                    </button>
                  </div>

                  {/* Seçili haftanın tarih aralığı */}
                  <div className="text-xs text-center text-gray-300 font-semibold">
                    {getWeekLabel(calendarPreviewWeek)}
                  </div>
                </div>
              )}
            </div>
            {selectedWeek && (
              <button
                onClick={clearWeekFilter}
                className="mt-1 text-xs text-red-600 hover:text-red-700"
              >
                ✕ Temizle
              </button>
            )}
          </div>
        </div>

        {/* Aktif Filtre Bilgisi */}
        {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignedTo !== 'all' || selectedWeek !== null) && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Gösterilen: <span className="font-semibold text-indigo-600">{filteredTasks.length}</span> / {tasks.length} görev
            </p>
            <button
              onClick={() => {
                setFilters({ status: 'all', priority: 'all', assignedTo: 'all' });
                setSelectedWeek(null);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* Task Ekleme Formu - Sadece CREATE_TASK yetkisi olanlara göster */}
      {canCreateTask && (
        <div className="mb-4">
          {!showTaskForm ? (
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              + Yeni Görev
            </button>
          ) : (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-100 mb-3">Yeni Görev Oluştur</h3>
              <input
                type="text"
                placeholder="Görev Başlığı *"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full mb-2 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500"
              />
              <textarea
                placeholder="Açıklama (opsiyonel)"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full mb-2 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500"
                rows={3}
              />
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Atanacak Kişi
              </label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">Atanmadı</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as 'todo' | 'in-progress' | 'done' })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="todo">Yapılacak</option>
                  <option value="in-progress">Devam Ediyor</option>
                  <option value="done">Tamamlandı</option>
                </select>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="low">Düşük Öncelik</option>
                  <option value="medium">Orta Öncelik</option>
                  <option value="high">Yüksek Öncelik</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateTask}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskForm({
                      title: '',
                      description: '',
                      assignedTo: '',
                      priority: 'medium',
                      status: 'todo'
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!canCreateTask && (
        <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-200">
            ℹ️ Görev oluşturma yetkiniz yok. Sadece mevcut görevleri görüntüleyebilirsiniz.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-lg">Bu takımda henüz görev yok</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-yellow-900 rounded-lg border border-yellow-700">
          <p className="text-yellow-200 text-lg">Filtreye uygun görev bulunamadı</p>
          <button
            onClick={() => {
              setFilters({ status: 'all', priority: 'all', assignedTo: 'all' });
              setSelectedWeek(null);
            }}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Tüm Görevleri Göster
          </button>
        </div>
      ) : (
        <MemoizedVirtualizedList
          items={filteredTasks}
          itemKey={(t) => t.id}
          itemHeight={120}
          height={Math.min(600, Math.max(320, filteredTasks.length * 120))}
          className=""
          renderItem={(task) => {
            const assignedMember = task.assignedTo ? membersMap.get(task.assignedTo) : undefined;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`border rounded-lg px-3 py-2 hover:shadow-md transition-shadow cursor-pointer h-[120px] ${task.status === 'done'
                    ? 'bg-green-900/20 border-green-700'
                    : task.status === 'in-progress'
                      ? 'bg-blue-900/20 border-blue-700'
                      : 'bg-gray-800 border-gray-700'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-100">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-400 mt-0.5 line-clamp-1 text-sm">{task.description}</p>
                    )}
                    {assignedMember && (
                      <p className="text-xs text-blue-400 mt-0.5">
                        👤 {assignedMember.displayName || assignedMember.email}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-1.5 py-0.5 text-xs rounded item ${task.priority === 'high'
                            ? 'bg-red-900 text-red-200'
                            : task.priority === 'medium'
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                      >
                        {task.priority === 'high'
                          ? '🔴'
                          : task.priority === 'medium'
                            ? '🟡'
                            : '⚪'}
                      </span>
                    </div>
                  </div>
                  {canDeleteTask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="ml-2 hover:text-red-300 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 my-auto rounded-lg "
                    >
                      <h1 className="text-xs">🗑️ Sil</h1>
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />
      )}

      {/* Daha Fazla Yükle */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => loadMore(selectedTeam)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 hover:bg-gray-700"
          >
            Daha Fazla Yükle
          </button>
        </div>
      )}

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

