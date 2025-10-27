import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ITeam } from '../models/Team.model';
import { ITask } from '../models/Task.model';
import { getTaskService, getTeamMemberInfoService } from '../di/container';
import { TaskModal } from './TaskModal';
import { IMemberWithRole } from '../services/TeamMemberInfoService';
// PrimeReact Calendar locale hatası nedeniyle kaldırıldı, HTML5 date picker kullanılacak

interface TasksViewProps {
  userTeams: ITeam[];
}

export const TasksView = ({ userTeams }: TasksViewProps) => {
  const { user } = useAuthContext();
  const [selectedTeam, setSelectedTeam] = useState<string>(userTeams[0]?.id || '');
  const { hasPermission } = usePermissions(selectedTeam);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [members, setMembers] = useState<IMemberWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in-progress' | 'done'
  });
  
  // Filtreler
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'todo' | 'in-progress' | 'done',
    priority: 'all' as 'all' | 'low' | 'medium' | 'high',
    assignedTo: 'all' as string,
  });
  
  // Haftalık tarih seçimi için
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPreviewWeek, setCalendarPreviewWeek] = useState<Date>(new Date());
  
  const taskService = getTaskService();
  const memberInfoService = getTeamMemberInfoService();
  
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
      fetchTasks();
    }
  }, [selectedTeam]);

  // Filtreleri uygula
  useEffect(() => {
    applyFilters();
  }, [tasks, filters, selectedWeek, searchQuery]);

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

  const applyFilters = () => {
    let filtered = [...tasks];

    // Arama filtresi
    if (searchQuery.trim()) {
      filtered = filtered.filter((task) => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filtresi
    if (filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Priority filtresi
    if (filters.priority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Atanan kişi filtresi
    if (filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        filtered = filtered.filter((task) => !task.assignedTo);
      } else {
        filtered = filtered.filter((task) => task.assignedTo === filters.assignedTo);
      }
    }

    // Haftalık tarih filtresi
    if (selectedWeek) {
      const { start, end } = getWeekRange(selectedWeek);
      
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }

    setFilteredTasks(filtered);
  };

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

  const fetchTasks = async () => {
    if (!selectedTeam) return;
    
    setLoading(true);
    
    // Tasks'i getir
    const result = await taskService.getTasksByTeam(selectedTeam);
    if (result.success) {
      setTasks(result.data);
    }
    
    // Team üyelerini getir
    const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);
    if (selectedTeamData && selectedTeamData.members) {
      const membersInfo = await memberInfoService.getMembersWithInfo(
        selectedTeam,
        selectedTeamData.members
      );
      setMembers(membersInfo);
    }
    
    setLoading(false);
  };

  const handleCreateTask = async () => {
    if (!user || !selectedTeam || !taskForm.title.trim()) return;

    const result = await taskService.createTask({
      teamId: selectedTeam,
      title: taskForm.title,
      description: taskForm.description || undefined,
      assignedTo: taskForm.assignedTo || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
    });

    if (result.success) {
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        status: 'todo'
      });
      setShowTaskForm(false);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!selectedTeam || !window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    await taskService.deleteTask(selectedTeam, id);
    fetchTasks();
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ITask>) => {
    if (!selectedTeam) return;
    await taskService.updateTask(selectedTeam, taskId, updates);
    fetchTasks();
  };

  const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Görevler</h2>
        
        {/* Team Selector */}
        {userTeams.length > 1 && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-indigo-900">{selectedTeamData.name}</h3>
              <p className="text-sm text-indigo-700">
                {selectedTeamData.description || 'Açıklama yok'}
              </p>
            </div>
            {canViewTeamId && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Takım ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-indigo-300 text-indigo-800">
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
      <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Arama</h3>
        <input
          type="text"
          placeholder="Task başlığı, açıklama veya atanan kişi ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filtreler */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as typeof filters.status })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Tümü ({tasks.length})</option>
              <option value="todo">📝 Yapılacak ({tasks.filter(t => t.status === 'todo').length})</option>
              <option value="in-progress">⏳ Devam Ediyor ({tasks.filter(t => t.status === 'in-progress').length})</option>
              <option value="done">✅ Tamamlanan ({tasks.filter(t => t.status === 'done').length})</option>
            </select>
          </div>

          {/* Priority Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Öncelik</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as typeof filters.priority })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Tümü</option>
              <option value="high">🔴 Yüksek ({tasks.filter(t => t.priority === 'high').length})</option>
              <option value="medium">🟡 Orta ({tasks.filter(t => t.priority === 'medium').length})</option>
              <option value="low">⚪ Düşük ({tasks.filter(t => t.priority === 'low').length})</option>
            </select>
          </div>

          {/* Atanan Kişi Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Atanan Kişi</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Tümü</option>
              <option value="unassigned">Atanmamış ({tasks.filter(t => !t.assignedTo).length})</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName || member.email} ({tasks.filter(t => t.assignedTo === member.userId).length})
                </option>
              ))}
            </select>
          </div>

          {/* Tarih Filtresi - Haftalık */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Haftalık Tarih</label>
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-3 py-2 border rounded-lg text-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>
                  {selectedWeek ? getWeekLabel(selectedWeek) : '📅 Hafta Seç'}
                </span>
                <span className="text-gray-400">▼</span>
              </button>
              
              {showCalendar && (
                <div className="absolute z-50 mt-1 bg-white border rounded-lg shadow-xl p-3 w-80">
                  {/* Basit hafta seçici */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Pzt</div>
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Sal</div>
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Çar</div>
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Per</div>
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Cum</div>
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Cmt</div>
                    <div className="text-xs font-semibold text-center text-gray-600 p-2">Paz</div>
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
                          className={`text-xs p-2 rounded ${
                            isSelected 
                              ? 'bg-indigo-600 text-white font-semibold' 
                              : 'hover:bg-gray-100'
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
                      className="flex-1 text-xs bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      ← Önceki Hafta
                    </button>
                    <button
                      onClick={() => {
                        const next = new Date(calendarPreviewWeek);
                        next.setDate(next.getDate() + 7);
                        setCalendarPreviewWeek(next);
                      }}
                      className="flex-1 text-xs bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
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
                      className="flex-1 text-xs bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
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
                      className="flex-1 text-xs bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                    >
                      ← Geçen Hafta
                    </button>
                  </div>
                  
                  {/* Seçili haftanın tarih aralığı */}
                  <div className="text-xs text-center text-gray-600 font-semibold">
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Yeni Görev Oluştur</h3>
            <input
              type="text"
              placeholder="Görev Başlığı *"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full mb-2 px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Açıklama (opsiyonel)"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full mb-2 px-4 py-2 border rounded-lg"
              rows={3}
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atanacak Kişi
            </label>
            <select
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              className="w-full mb-2 px-4 py-2 border rounded-lg"
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
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ Görev oluşturma yetkiniz yok. Sadece mevcut görevleri görüntüleyebilirsiniz.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Bu takımda henüz görev yok</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-lg">Filtreye uygun görev bulunamadı</p>
          <button
            onClick={() => {
              setFilters({ status: 'all', priority: 'all', assignedTo: 'all' });
              setSelectedWeek(null);
            }}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Tüm Görevleri Göster
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
            const assignedMember = members.find((m) => m.userId === task.assignedTo);
            
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    {assignedMember && (
                      <p className="text-sm text-blue-600 mt-1">
                        👤 {assignedMember.displayName || assignedMember.email}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          task.status === 'done'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status === 'done'
                          ? 'Tamamlandı'
                          : task.status === 'in-progress'
                          ? 'Devam Ediyor'
                          : 'Yapılacak'}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.priority === 'high'
                          ? 'Yüksek'
                          : task.priority === 'medium'
                          ? 'Orta'
                          : 'Düşük'}
                      </span>
                    </div>
                  </div>
                  {canDeleteTask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

