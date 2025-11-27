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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Team Repositories</h2>

                {/* Team Selector */}
                {userTeams.length > 1 && (
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="px-4 py-2 glass border border-indigo-500/30 rounded-xl text-indigo-200 focus:ring-2 focus:ring-indigo-500 transition-all hover:border-indigo-400"
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
                <div className="mb-6 p-4 glass rounded-2xl border border-indigo-500/20 shadow-glow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-indigo-200">{selectedTeamData.name}</h3>
                            <p className="text-sm text-indigo-300/70">
                                {selectedTeamData.description || 'Açıklama yok'}
                            </p>
                        </div>
                        {canViewTeamId && (
                            <div className="text-right">
                                <p className="text-xs text-indigo-300/50 mb-1">Takım ID</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <code className="text-sm font-mono glass px-2 py-1 rounded-lg border border-indigo-500/30 text-indigo-300">
                                        {selectedTeamData.id}
                                    </code>
                                    <button
                                        onClick={() => handleCopyTeamId(selectedTeamData.id)}
                                        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 p-2 rounded-lg border border-indigo-500/30 transition-all hover:border-indigo-400 transform hover:scale-105"
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
                    className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 transform ${
                        activeTab === 'notes'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
                            : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105'
                    }`}
                >
                    📝 Notlar
                </button>
                <button
                    onClick={() => setActiveTab('todos')}
                    className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 transform ${
                        activeTab === 'todos'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
                            : 'glass text-indigo-200 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105'
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
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                                >
                                    + Yeni Not
                                </button>
                            ) : (
                                <div className="glass rounded-2xl p-4 border border-indigo-500/20">
                                    <input
                                        type="text"
                                        placeholder="Not Başlığı"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50"
                                    />
                                    <textarea
                                        placeholder="Not İçeriği"
                                        value={noteForm.content}
                                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50"
                                        rows={4}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kategori (opsiyonel)"
                                        value={noteForm.category}
                                        onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateNote}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNoteForm(false);
                                                setNoteForm({ title: '', content: '', category: '' });
                                            }}
                                            className="bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30"
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
                    <div className="mb-4 glass rounded-2xl p-4 border border-indigo-500/20 shadow-glow">
                        <h3 className="text-sm font-bold text-indigo-200 mb-3">🔍 Arama</h3>
                        <input
                            type="text"
                            placeholder="Not başlığı, içerik veya kategori ara..."
                            value={noteSearchQuery}
                            onChange={(e) => setNoteSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
                        />
                    </div>

                    {/* Filtreler */}
                    <div className="mb-4 glass rounded-2xl p-4 border border-indigo-500/20 shadow-glow">
                        <h3 className="text-sm font-bold text-indigo-200 mb-3">🔍 Filtreler</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-indigo-300/80 mb-2">Tarih Sıralama</label>
                                <select
                                    value={noteFilter.dateSort}
                                    onChange={(e) => setNoteFilter({ ...noteFilter, dateSort: e.target.value as 'newest' | 'oldest' })}
                                    className="w-full px-3 py-2 glass border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all"
                                >
                                    <option value="newest">En Yeniden En Eskiye</option>
                                    <option value="oldest">En Eskiden En Yeniye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-indigo-300/80 mb-2">Oluşturan Kişi</label>
                                <select
                                    value={noteFilter.creatorId}
                                    onChange={(e) => setNoteFilter({ ...noteFilter, creatorId: e.target.value })}
                                    className="w-full px-3 py-2 glass border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all"
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
                        <div className="flex flex-col justify-center items-center py-16">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-purple-600/20" style={{ animationDirection: 'reverse' }}></div>
                            </div>
                            <p className="mt-4 text-indigo-300 font-semibold">Yükleniyor...</p>
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-16 glass rounded-2xl border border-indigo-500/20">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-xl font-bold text-indigo-200">Henüz not yok</p>
                            <p className="text-sm text-indigo-300/60 mt-2">İlk notunuzu oluşturmak için yukarıdaki butonu kullanın</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className={`glass rounded-2xl p-4 border transition-all duration-300 hover:shadow-glow ${
                                        note.isPinned 
                                            ? 'border-lime-500/50 bg-gradient-to-br from-lime-950/30 to-emerald-950/30 shadow-lime-500/20' 
                                            : 'border-indigo-500/20 hover:border-indigo-400/40'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-indigo-100">
                                            {note.isPinned && '📌 '}
                                            {note.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            {canEditRepository && (
                                                <button
                                                    onClick={() => startEditNote(note)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                    title="Düzenle"
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                            {canEditRepository && (
                                                <button
                                                    onClick={() => handleTogglePin(note.id)}
                                                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                    title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                                                >
                                                    {note.isPinned ? '🔓' : '📌'}
                                                </button>
                                            )}
                                            {canDeleteRepository && (
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                    title="Sil"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-indigo-200/80 mb-3 whitespace-pre-wrap h-40 overflow-y-auto">{note.content}</p>
                                    {note.category && (
                                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl mb-3">
                                            {note.category}
                                        </span>
                                    )}
                                    <p className="text-xs text-indigo-300/60 mt-2">
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
                    <div className="mb-4 glass rounded-2xl p-4 border border-indigo-500/20 shadow-glow">
                        <h3 className="text-sm font-bold text-indigo-200 mb-3">🔍 Arama</h3>
                        <input
                            type="text"
                            placeholder="To-Do başlığı veya açıklama ara..."
                            value={todoSearchQuery}
                            onChange={(e) => setTodoSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
                        />
                    </div>

                    {/* Filtreler */}
                    <div className="mb-4 glass rounded-2xl p-4 border border-indigo-500/20 shadow-glow">
                        <h3 className="text-sm font-bold text-indigo-200 mb-3">🔍 Filtreler</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-indigo-300/80 mb-2">Tarih Sıralama</label>
                                <select
                                    value={todoFilter.dateSort}
                                    onChange={(e) => setTodoFilter({ ...todoFilter, dateSort: e.target.value as 'newest' | 'oldest' })}
                                    className="w-full px-3 py-2 glass border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all"
                                >
                                    <option value="newest">En Yeniden En Eskiye</option>
                                    <option value="oldest">En Eskiden En Yeniye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-indigo-300/80 mb-2">Oluşturan Kişi</label>
                                <select
                                    value={todoFilter.creatorId}
                                    onChange={(e) => setTodoFilter({ ...todoFilter, creatorId: e.target.value })}
                                    className="w-full px-3 py-2 glass border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm hover:border-indigo-400/50 transition-all"
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
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                                >
                                    + Yeni To-Do
                                </button>
                            ) : (
                                <div className="glass rounded-2xl p-4 border border-indigo-500/20">
                                    <input
                                        type="text"
                                        placeholder="To-Do Başlığı"
                                        value={todoForm.title}
                                        onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50"
                                    />
                                    <textarea
                                        placeholder="Açıklama (opsiyonel)"
                                        value={todoForm.description}
                                        onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50"
                                        rows={2}
                                    />
                                    <select
                                        value={todoForm.assignedTo}
                                        onChange={(e) => setTodoForm({ ...todoForm, assignedTo: e.target.value })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
                                    >
                                        <option value="">Atama yapılmadı (Opsiyonel)</option>
                                        {members.map((member) => (
                                            <option key={member.userId} value={member.userId}>
                                                {member.displayName || member.email || member.userId}
                                                {member.displayName && member.email ? ` (${member.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={todoForm.priority}
                                        onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                        className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all"
                                    >
                                        <option value="low">Düşük Öncelik</option>
                                        <option value="medium">Orta Öncelik</option>
                                        <option value="high">Yüksek Öncelik</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateTodo}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowTodoForm(false);
                                                setTodoForm({ title: '', description: '', priority: 'medium', assignedTo: '' });
                                            }}
                                            className="bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30"
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
                        <div className="flex flex-col justify-center items-center py-16">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-purple-600/20" style={{ animationDirection: 'reverse' }}></div>
                            </div>
                            <p className="mt-4 text-indigo-300 font-semibold">Yükleniyor...</p>
                        </div>
                    ) : filteredTodos.length === 0 ? (
                        <div className="text-center py-16 glass rounded-2xl border border-indigo-500/20">
                            <div className="text-6xl mb-4">✅</div>
                            <p className="text-xl font-bold text-indigo-200">Henüz todo yok</p>
                            <p className="text-sm text-indigo-300/60 mt-2">İlk todo'nuzu oluşturmak için yukarıdaki butonu kullanın</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {filteredTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={`glass rounded-2xl p-4 flex items-start gap-3 border transition-all duration-300 hover:shadow-glow ${
                                        todo.completed ? 'opacity-60 border-indigo-400/20' : 'border-indigo-500/20 hover:border-indigo-400/40'
                                    }`}
                                >
                                    {canEditRepository ? (
                                        <div className="flex items-center mt-1">
                                            <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => handleToggleTodo(todo.id)}
                                                className="w-6 h-6 rounded-lg border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-purple-600 checked:border-transparent transition-all duration-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </div>
                                    ) : (
                                        <div className={`mt-1 w-6 h-6 border-2 rounded-lg flex items-center justify-center ${
                                            todo.completed ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent' : 'border-indigo-500/50 bg-slate-800/50'
                                        }`}>
                                            {todo.completed && <span className="text-xs text-white font-bold">✓</span>}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3
                                            className={`font-bold ${todo.completed ? 'line-through text-indigo-300/50' : 'text-indigo-100'
                                                }`}
                                        >
                                            {todo.title}
                                        </h3>
                                        {todo.description && (
                                            <p className="text-sm text-indigo-200/70 mt-1">{todo.description}</p>
                                        )}
                                        {todo.assignedTo && (
                                            <p className="text-xs text-blue-400 mt-1 font-semibold">🎯 Atanan: {todo.assignedTo}</p>
                                        )}
                                        <div className="mt-2 flex gap-2 items-center flex-wrap">
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-bold rounded-xl ${
                                                    todo.priority === 'high'
                                                        ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300'
                                                        : todo.priority === 'medium'
                                                            ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-300'
                                                            : 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/30 text-slate-300'
                                                }`}
                                            >
                                                {todo.priority === 'high' ? '🔴 Yüksek' : todo.priority === 'medium' ? '🟡 Orta' : '⚪ Düşük'}
                                            </span>
                                            <p className="text-xs text-indigo-300/60">
                                                📅 {new Date(todo.createdAt).toLocaleString('tr-TR')} 👤 {getUserName(todo.createdBy)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 flex-col">
                                        {canEditRepository && (
                                            <button
                                                onClick={() => startEditTodo(todo)}
                                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                title="Düzenle"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                        {canDeleteRepository && (
                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                title="Sil"
                                            >
                                                🗑️
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
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
                    <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-glow-lg border border-indigo-500/20 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                Notu Düzenle
                            </h3>
                            <button 
                                onClick={() => setEditingNote(null)} 
                                className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={editNoteForm.title}
                                    onChange={(e) => setEditNoteForm({ ...editNoteForm, title: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
                                    placeholder="Başlık"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">İçerik</label>
                                <textarea
                                    value={editNoteForm.content}
                                    onChange={(e) => setEditNoteForm({ ...editNoteForm, content: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
                                    rows={6}
                                    placeholder="İçerik"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Kategori</label>
                                <input
                                    type="text"
                                    value={editNoteForm.category}
                                    onChange={(e) => setEditNoteForm({ ...editNoteForm, category: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
                                    placeholder="Kategori"
                                />
                            </div>
                            <label className="flex items-center gap-2 p-3 sm:p-4 glass rounded-xl border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/10 transition-all">
                                <input
                                    type="checkbox"
                                    checked={editNoteForm.isPinned}
                                    onChange={(e) => setEditNoteForm({ ...editNoteForm, isPinned: e.target.checked })}
                                    className="w-5 h-5 rounded border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-purple-600 checked:border-transparent transition-all cursor-pointer"
                                />
                                <span className="text-sm sm:text-base text-indigo-200 font-semibold">📌 Notu Sabitle</span>
                            </label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                            <button
                                onClick={handleUpdateNote}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 text-sm sm:text-base"
                            >
                                Kaydet
                            </button>
                            <button
                                onClick={() => setEditingNote(null)}
                                className="w-full sm:w-auto px-4 sm:px-6 bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingTodo && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
                    <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-glow-lg border border-indigo-500/20 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                To-Do'yu Düzenle
                            </h3>
                            <button 
                                onClick={() => setEditingTodo(null)} 
                                className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={editTodoForm.title}
                                    onChange={(e) => setEditTodoForm({ ...editTodoForm, title: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
                                    placeholder="Başlık"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Açıklama</label>
                                <textarea
                                    value={editTodoForm.description}
                                    onChange={(e) => setEditTodoForm({ ...editTodoForm, description: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
                                    rows={4}
                                    placeholder="Açıklama"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Öncelik</label>
                                <select
                                    value={editTodoForm.priority}
                                    onChange={(e) => setEditTodoForm({ ...editTodoForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
                                >
                                    <option value="low">⚪ Düşük Öncelik</option>
                                    <option value="medium">🟡 Orta Öncelik</option>
                                    <option value="high">🔴 Yüksek Öncelik</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 p-3 sm:p-4 glass rounded-xl border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/10 transition-all">
                                <input
                                    type="checkbox"
                                    checked={editTodoForm.completed}
                                    onChange={(e) => setEditTodoForm({ ...editTodoForm, completed: e.target.checked })}
                                    className="w-5 h-5 rounded border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-green-600 checked:to-emerald-600 checked:border-transparent transition-all cursor-pointer"
                                />
                                <span className="text-sm sm:text-base text-indigo-200 font-semibold">✅ Tamamlandı</span>
                            </label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                            <button
                                onClick={handleUpdateTodo}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 text-sm sm:text-base"
                            >
                                Kaydet
                            </button>
                            <button
                                onClick={() => setEditingTodo(null)}
                                className="w-full sm:w-auto px-4 sm:px-6 bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
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
