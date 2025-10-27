import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ITeam } from '../models/Team.model';
import { getTeamNoteService, getTeamTodoService, getTeamMemberInfoService } from '../di/container';
import { ITeamNote, ITeamTodo } from '../models/TeamRepository.model';
import { IMemberWithRole } from '../services/TeamMemberInfoService';

interface RepositoriesViewProps {
    userTeams: ITeam[];
}

type TabType = 'notes' | 'todos';

export const RepositoriesView = ({ userTeams }: RepositoriesViewProps) => {
    const { user } = useAuthContext();
    const [selectedTeam, setSelectedTeam] = useState<string>(userTeams[0]?.id || '');
    const { hasPermission } = usePermissions(selectedTeam);
    const [activeTab, setActiveTab] = useState<TabType>('notes');
  // Filtrelenmiş veriler
  const [, setNotes] = useState<ITeamNote[]>([]);
  const [, setTodos] = useState<ITeamTodo[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<ITeamNote[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<ITeamTodo[]>([]);
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<IMemberWithRole[]>([]);

    // Arama
    const [noteSearchQuery, setNoteSearchQuery] = useState('');
    const [todoSearchQuery, setTodoSearchQuery] = useState('');

    // Filtreler
    const [noteFilter, setNoteFilter] = useState({
        dateSort: 'newest' as 'newest' | 'oldest',
        creatorId: 'all' as string,
    });
    const [todoFilter, setTodoFilter] = useState({
        dateSort: 'newest' as 'newest' | 'oldest',
        creatorId: 'all' as string,
    });

    // Düzenleme state'leri
    const [editingNote, setEditingNote] = useState<ITeamNote | null>(null);
    const [editingTodo, setEditingTodo] = useState<ITeamTodo | null>(null);
    const [editNoteForm, setEditNoteForm] = useState({ title: '', content: '', category: '', isPinned: false });
    const [editTodoForm, setEditTodoForm] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high', completed: false });

    const canCreateRepository = hasPermission('CREATE_REPOSITORY');
    const canEditRepository = hasPermission('EDIT_REPOSITORY');
    const canDeleteRepository = hasPermission('DELETE_REPOSITORY');
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

    // Form states
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [showTodoForm, setShowTodoForm] = useState(false);
    const [noteForm, setNoteForm] = useState({ title: '', content: '', category: '' });
    const [todoForm, setTodoForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        assignedTo: ''
    });

    const noteService = getTeamNoteService();
    const todoService = getTeamTodoService();
    const memberInfoService = getTeamMemberInfoService();

    useEffect(() => {
        if (selectedTeam) {
            fetchData();
            fetchMembers();
        }
    }, [selectedTeam, activeTab, noteFilter, todoFilter, noteSearchQuery, todoSearchQuery]);

    const fetchMembers = async () => {
        if (!selectedTeam) return;
        const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);
        if (!selectedTeamData) return;

        try {
            const membersData = await memberInfoService.getMembersWithInfo(selectedTeam, selectedTeamData.members);
            setMembers(membersData);
        } catch (error) {
            console.error('Üyeler alınamadı:', error);
        }
    };

    const fetchData = async () => {
        if (!selectedTeam) return;

        setLoading(true);
        if (activeTab === 'notes') {
            const result = await noteService.getTeamNotes(selectedTeam);
            if (result.success) {
                let filteredNotes = [...result.data];

                // Arama filtresini uygula
                if (noteSearchQuery.trim()) {
                    filteredNotes = filteredNotes.filter(note =>
                        note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
                        note.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
                        note.category?.toLowerCase().includes(noteSearchQuery.toLowerCase())
                    );
                }

                // Filtreleri uygula
                if (noteFilter.creatorId !== 'all') {
                    filteredNotes = filteredNotes.filter(note => note.createdBy === noteFilter.creatorId);
                }

                // Tarihe göre sırala
                if (noteFilter.dateSort === 'newest') {
                    filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                } else {
                    filteredNotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                }

                // Sabitlenmiş notları en başa taşı
                filteredNotes.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return 0;
                });

                // Orijinal ve filtrelenmiş verileri kaydet
                setFilteredNotes(filteredNotes);
                setNotes(result.data);
            }
        } else {
            const result = await todoService.getTeamTodos(selectedTeam);
            if (result.success) {
                let filteredTodos = [...result.data];

                // Arama filtresini uygula
                if (todoSearchQuery.trim()) {
                    filteredTodos = filteredTodos.filter(todo =>
                        todo.title.toLowerCase().includes(todoSearchQuery.toLowerCase()) ||
                        todo.description?.toLowerCase().includes(todoSearchQuery.toLowerCase())
                    );
                }

                // Filtreleri uygula
                if (todoFilter.creatorId !== 'all') {
                    filteredTodos = filteredTodos.filter(todo => todo.createdBy === todoFilter.creatorId);
                }

                // Tarihe göre sırala
                if (todoFilter.dateSort === 'newest') {
                    filteredTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                } else {
                    filteredTodos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                }

                // Orijinal ve filtrelenmiş verileri kaydet
                setFilteredTodos(filteredTodos);
                setTodos(result.data);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [noteFilter, todoFilter]);

    const getUserName = (userId: string): string => {
        const member = members.find(m => m.userId === userId);
        return member?.displayName || member?.email || userId;
    };

    const handleCreateNote = async () => {
        if (!user || !selectedTeam || !noteForm.title.trim()) return;

        const result = await noteService.createNote(selectedTeam, user.uid, noteForm);
        if (result.success) {
            setNoteForm({ title: '', content: '', category: '' });
            setShowNoteForm(false);
            fetchData();
        }
    };

    const handleCreateTodo = async () => {
        if (!user || !selectedTeam || !todoForm.title.trim()) return;

        const result = await todoService.createTodo(selectedTeam, user.uid, {
            ...todoForm,
            assignedTo: todoForm.assignedTo || undefined
        });
        if (result.success) {
            setTodoForm({ title: '', description: '', priority: 'medium', assignedTo: '' });
            setShowTodoForm(false);
            fetchData();
        }
    };

    const handleToggleTodo = async (id: string) => {
        if (!user || !selectedTeam) return;
        await todoService.toggleComplete(selectedTeam, id, user.uid);
        fetchData();
    };

    const handleDeleteNote = async (id: string) => {
        if (!user || !selectedTeam || !window.confirm('Bu notu silmek istediğinize emin misiniz?')) return;
        await noteService.deleteNote(selectedTeam, id, user.uid);
        fetchData();
    };

    const handleDeleteTodo = async (id: string) => {
        if (!user || !selectedTeam || !window.confirm('Bu todo\'yu silmek istediğinize emin misiniz?')) return;
        await todoService.deleteTodo(selectedTeam, id, user.uid);
        fetchData();
    };

    const handleTogglePin = async (id: string) => {
        if (!user || !selectedTeam) return;
        
        // Mevcut sabitlenmiş notları say (filteredNotes'dan)
        const pinnedCount = filteredNotes.filter(note => note.isPinned).length;
        const noteToToggle = filteredNotes.find(note => note.id === id);
        
        // Sabitlemek istiyorsa ve 3'ten fazla sabitli not varsa uyarı ver
        if (!noteToToggle?.isPinned && pinnedCount >= 3) {
            alert('En fazla 3 not sabitlenebilir. Lütfen önce bir sabitlenmiş notu çözün.');
            return;
        }
        
        await noteService.togglePin(selectedTeam, id, user.uid);
        fetchData();
    };

    const handleUpdateNote = async () => {
        if (!user || !selectedTeam || !editingNote) return;

        const result = await noteService.updateNote(selectedTeam, editingNote.id, user.uid, {
            title: editNoteForm.title,
            content: editNoteForm.content,
            category: editNoteForm.category,
            isPinned: editNoteForm.isPinned,
        });

        if (result.success) {
            setEditingNote(null);
            setEditNoteForm({ title: '', content: '', category: '', isPinned: false });
            fetchData();
        }
    };

    const handleUpdateTodo = async () => {
        if (!user || !selectedTeam || !editingTodo) return;

        const result = await todoService.updateTodo(selectedTeam, editingTodo.id, user.uid, {
            title: editTodoForm.title,
            description: editTodoForm.description,
            priority: editTodoForm.priority,
            completed: editTodoForm.completed,
        });

        if (result.success) {
            setEditingTodo(null);
            setEditTodoForm({ title: '', description: '', priority: 'medium', completed: false });
            fetchData();
        }
    };

    const startEditNote = (note: ITeamNote) => {
        setEditingNote(note);
        setEditNoteForm({
            title: note.title,
            content: note.content,
            category: note.category || '',
            isPinned: note.isPinned,
        });
    };

    const startEditTodo = (todo: ITeamTodo) => {
        setEditingTodo(todo);
        setEditTodoForm({
            title: todo.title,
            description: todo.description || '',
            priority: todo.priority,
            completed: todo.completed,
        });
    };

    const selectedTeamData = userTeams.find((t) => t.id === selectedTeam);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-100">Team Repositories</h2>

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
                                <div className="flex items-center gap-2 justify-end">
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'notes'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    📝 Notlar
                </button>
                <button
                    onClick={() => setActiveTab('todos')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'todos'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    ✅ To-Do List
                </button>
            </div>

            {/* Notes Tab */}
            {activeTab === 'notes' && (
                <div>
                    {canCreateRepository ? (
                        <div className="mb-4">
                            {!showNoteForm ? (
                                <button
                                    onClick={() => setShowNoteForm(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                                >
                                    + Yeni Not
                                </button>
                            ) : (
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder="Not Başlığı"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                    />
                                    <textarea
                                        placeholder="Not İçeriği"
                                        value={noteForm.content}
                                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                        rows={4}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kategori (opsiyonel)"
                                        value={noteForm.category}
                                        onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateNote}
                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNoteForm(false);
                                                setNoteForm({ title: '', content: '', category: '' });
                                            }}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                ℹ️ Not oluşturma yetkiniz yok. Sadece mevcut notları görüntüleyebilirsiniz.
                            </p>
                        </div>
                    )}

                    {/* Arama */}
                    <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Arama</h3>
                        <input
                            type="text"
                            placeholder="Not başlığı, içerik veya kategori ara..."
                            value={noteSearchQuery}
                            onChange={(e) => setNoteSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>

                    {/* Filtreler */}
                    <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Filtreler</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tarih Sıralama</label>
                                <select
                                    value={noteFilter.dateSort}
                                    onChange={(e) => setNoteFilter({ ...noteFilter, dateSort: e.target.value as 'newest' | 'oldest' })}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-200"
                                >
                                    <option value="newest">En Yeniden En Eskiye</option>
                                    <option value="oldest">En Eskiden En Yeniye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Oluşturan Kişi</label>
                                <select
                                    value={noteFilter.creatorId}
                                    onChange={(e) => setNoteFilter({ ...noteFilter, creatorId: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-200"
                                >
                                    <option value="all">Tümü</option>
                                    {members.map((member) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.displayName || member.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Henüz not yok</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className={`border rounded-lg p-4 ${note.isPinned ? 'border-lime-500 bg-lime-900' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-200">
                                            {note.isPinned && '📌 '}
                                            {note.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            {canEditRepository && (
                                                <button
                                                    onClick={() => startEditNote(note)}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                            {canEditRepository && (
                                                <button
                                                    onClick={() => handleTogglePin(note.id)}
                                                    className="text-sm text-yellow-600 hover:text-yellow-700"
                                                >
                                                    {note.isPinned ? 'Çöz' : 'Sabitle'}
                                                </button>
                                            )}
                                            {canDeleteRepository && (
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="text-sm text-red-600 hover:text-red-700"
                                                >
                                                    Sil
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-2 whitespace-pre-wrap">{note.content}</p>
                                    {note.category && (
                                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                            {note.category}
                                        </span>
                                    )}
                                    <p className="text-xs text-white/60 mt-2">
                                        📅 {new Date(note.createdAt).toLocaleString('tr-TR')} 👤 {getUserName(note.createdBy)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Todos Tab */}
            {activeTab === 'todos' && (
                <div>
                    {/* Arama */}
                    <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Arama</h3>
                        <input
                            type="text"
                            placeholder="To-Do başlığı veya açıklama ara..."
                            value={todoSearchQuery}
                            onChange={(e) => setTodoSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 bg-gray-900 text-indigo-200"
                        />
                    </div>

                    {/* Filtreler */}
                    <div className="mb-4 bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Filtreler</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tarih Sıralama</label>
                                <select
                                    value={todoFilter.dateSort}
                                    onChange={(e) => setTodoFilter({ ...todoFilter, dateSort: e.target.value as 'newest' | 'oldest' })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                >
                                    <option value="newest">En Yeniden En Eskiye</option>
                                    <option value="oldest">En Eskiden En Yeniye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Oluşturan Kişi</label>
                                <select
                                    value={todoFilter.creatorId}
                                    onChange={(e) => setTodoFilter({ ...todoFilter, creatorId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                >
                                    <option value="all">Tümü</option>
                                    {members.map((member) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.displayName || member.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {canCreateRepository ? (
                        <div className="mb-4">
                            {!showTodoForm ? (
                                <button
                                    onClick={() => setShowTodoForm(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                                >
                                    + Yeni To-Do
                                </button>
                            ) : (
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder="To-Do Başlığı"
                                        value={todoForm.title}
                                        onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                    />
                                    <textarea
                                        placeholder="Açıklama (opsiyonel)"
                                        value={todoForm.description}
                                        onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                        rows={2}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kullanıcı ID'si (atama için, opsiyonel)"
                                        value={todoForm.assignedTo}
                                        onChange={(e) => setTodoForm({ ...todoForm, assignedTo: e.target.value })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                    />
                                    <select
                                        value={todoForm.priority}
                                        onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                        className="w-full mb-2 px-4 py-2 border rounded-lg bg-gray-900 text-indigo-200 focus:ring-2 focus:ring-indigo-600 "
                                    >
                                        <option value="low">Düşük Öncelik</option>
                                        <option value="medium">Orta Öncelik</option>
                                        <option value="high">Yüksek Öncelik</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateTodo}
                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowTodoForm(false);
                                                setTodoForm({ title: '', description: '', priority: 'medium', assignedTo: '' });
                                            }}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                ℹ️ To-Do oluşturma yetkiniz yok. Sadece mevcut to-do'ları görüntüleyebilirsiniz.
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredTodos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Henüz todo yok</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={`border rounded-lg p-4 flex items-start gap-3 ${todo.completed ? 'bg-gray-50 opacity-75' : 'bg-gray-800'
                                        }`}
                                >
                                    {canEditRepository ? (
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => handleToggleTodo(todo.id)}
                                            className="mt-1 w-5 h-5"
                                        />
                                    ) : (
                                        <div className={`mt-1 w-5 h-5 border-2 rounded flex items-center justify-center ${todo.completed ? 'bg-gray-300 border-gray-400' : 'border-gray-300'
                                            }`}>
                                            {todo.completed && <span className="text-xs">✓</span>}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3
                                            className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'
                                                }`}
                                        >
                                            {todo.title}
                                        </h3>
                                        {todo.description && (
                                            <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                                        )}
                                        {todo.assignedTo && (
                                            <p className="text-xs text-blue-600 mt-1">Atanan: {todo.assignedTo}</p>
                                        )}
                                        <div className="mt-2 flex gap-2 items-center">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded ${todo.priority === 'high'
                                                    ? 'bg-red-100 text-red-800'
                                                    : todo.priority === 'medium'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük'}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                📅 {new Date(todo.createdAt).toLocaleString('tr-TR')} 👤 {getUserName(todo.createdBy)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 flex-col">
                                        {canEditRepository && (
                                            <button
                                                onClick={() => startEditTodo(todo)}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                        {canDeleteRepository && (
                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Sil
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Düzenleme Modal'ları */}
            {editingNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Notu Düzenle</h3>
                        <input
                            type="text"
                            value={editNoteForm.title}
                            onChange={(e) => setEditNoteForm({ ...editNoteForm, title: e.target.value })}
                            className="w-full mb-3 px-4 py-2 border rounded-lg"
                            placeholder="Başlık"
                        />
                        <textarea
                            value={editNoteForm.content}
                            onChange={(e) => setEditNoteForm({ ...editNoteForm, content: e.target.value })}
                            className="w-full mb-3 px-4 py-2 border rounded-lg"
                            rows={6}
                            placeholder="İçerik"
                        />
                        <input
                            type="text"
                            value={editNoteForm.category}
                            onChange={(e) => setEditNoteForm({ ...editNoteForm, category: e.target.value })}
                            className="w-full mb-3 px-4 py-2 border rounded-lg"
                            placeholder="Kategori"
                        />
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={editNoteForm.isPinned}
                                onChange={(e) => setEditNoteForm({ ...editNoteForm, isPinned: e.target.checked })}
                            />
                            <span>Sabitlenmiş</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdateNote}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold"
                            >
                                Kaydet
                            </button>
                            <button
                                onClick={() => setEditingNote(null)}
                                className="px-6 bg-gray-500 text-white py-2 rounded-lg font-semibold"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingTodo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">To-Do'yu Düzenle</h3>
                        <input
                            type="text"
                            value={editTodoForm.title}
                            onChange={(e) => setEditTodoForm({ ...editTodoForm, title: e.target.value })}
                            className="w-full mb-3 px-4 py-2 border rounded-lg"
                            placeholder="Başlık"
                        />
                        <textarea
                            value={editTodoForm.description}
                            onChange={(e) => setEditTodoForm({ ...editTodoForm, description: e.target.value })}
                            className="w-full mb-3 px-4 py-2 border rounded-lg"
                            rows={4}
                            placeholder="Açıklama"
                        />
                        <select
                            value={editTodoForm.priority}
                            onChange={(e) => setEditTodoForm({ ...editTodoForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                            className="w-full mb-3 px-4 py-2 border rounded-lg"
                        >
                            <option value="low">Düşük Öncelik</option>
                            <option value="medium">Orta Öncelik</option>
                            <option value="high">Yüksek Öncelik</option>
                        </select>
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={editTodoForm.completed}
                                onChange={(e) => setEditTodoForm({ ...editTodoForm, completed: e.target.checked })}
                            />
                            <span>Tamamlandı</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdateTodo}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold"
                            >
                                Kaydet
                            </button>
                            <button
                                onClick={() => setEditingTodo(null)}
                                className="px-6 bg-gray-500 text-white py-2 rounded-lg font-semibold"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
