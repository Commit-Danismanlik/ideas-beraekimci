import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getPersonalNoteService, getPersonalTodoService } from '../di/container';
import { IPersonalNote, IPersonalTodo } from '../models/PersonalRepository.model';

type TabType = 'notes' | 'todos';

export const PersonalRepositoriesView = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [notes, setNotes] = useState<IPersonalNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<IPersonalNote[]>([]);
  const [todos, setTodos] = useState<IPersonalTodo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<IPersonalTodo[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Arama
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [todoSearchQuery, setTodoSearchQuery] = useState('');
  
  // Form states
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: '' });
  const [todoForm, setTodoForm] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' });
  
  const noteService = getPersonalNoteService();
  const todoService = getPersonalTodoService();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  // Tab değiştiğinde search query'i temizle
  useEffect(() => {
    setNoteSearchQuery('');
    setTodoSearchQuery('');
  }, [activeTab]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    if (activeTab === 'notes') {
      const result = await noteService.getUserNotes(user.uid);
      if (result.success) {
        setNotes(result.data);
        
        // Arama filtresini uygula
        let filtered = [...result.data];
        if (noteSearchQuery.trim()) {
          filtered = filtered.filter(note =>
            note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
            note.category?.toLowerCase().includes(noteSearchQuery.toLowerCase())
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
    } else {
      const result = await todoService.getUserTodos(user.uid);
      if (result.success) {
        setTodos(result.data);
        
        // Arama filtresini uygula
        let filtered = [...result.data];
        if (todoSearchQuery.trim()) {
          filtered = filtered.filter(todo =>
            todo.title.toLowerCase().includes(todoSearchQuery.toLowerCase()) ||
            todo.description?.toLowerCase().includes(todoSearchQuery.toLowerCase())
          );
        }
        setFilteredTodos(filtered);
      }
    }
    setLoading(false);
  };
  
  // Arama değiştiğinde filtreleri tekrar uygula
  useEffect(() => {
    if (activeTab === 'notes') {
      let filtered = [...notes];
      if (noteSearchQuery.trim()) {
        filtered = filtered.filter(note =>
          note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
          note.category?.toLowerCase().includes(noteSearchQuery.toLowerCase())
        );
      }
      
      // Sabitlenmiş notları en başa taşı
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      
      setFilteredNotes(filtered);
    } else {
      let filtered = [...todos];
      if (todoSearchQuery.trim()) {
        filtered = filtered.filter(todo =>
          todo.title.toLowerCase().includes(todoSearchQuery.toLowerCase()) ||
          todo.description?.toLowerCase().includes(todoSearchQuery.toLowerCase())
        );
      }
      setFilteredTodos(filtered);
    }
  }, [noteSearchQuery, todoSearchQuery, activeTab, notes]);

  const handleCreateNote = async () => {
    if (!user || !noteForm.title.trim()) return;
    
    const result = await noteService.createNote(user.uid, noteForm);
    if (result.success) {
      setNoteForm({ title: '', content: '', category: '' });
      setShowNoteForm(false);
      fetchData();
    }
  };

  const handleCreateTodo = async () => {
    if (!user || !todoForm.title.trim()) return;
    
    const result = await todoService.createTodo(user.uid, todoForm);
    if (result.success) {
      setTodoForm({ title: '', description: '', priority: 'medium' });
      setShowTodoForm(false);
      fetchData();
    }
  };

  const handleToggleTodo = async (id: string) => {
    await todoService.toggleComplete(id);
    fetchData();
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
      await noteService.deleteNote(id);
      fetchData();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm('Bu todo\'yu silmek istediğinize emin misiniz?')) {
      await todoService.deleteTodo(id);
      fetchData();
    }
  };

  const handleTogglePin = async (id: string) => {
    // Mevcut sabitlenmiş notları say
    const pinnedCount = notes.filter(note => note.isPinned).length;
    const noteToToggle = notes.find(note => note.id === id);
    
    // Sabitlemek istiyorsa ve 3'ten fazla sabitli not varsa uyarı ver
    if (!noteToToggle?.isPinned && pinnedCount >= 3) {
      alert('En fazla 3 not sabitlenebilir. Lütfen önce bir sabitlenmiş notu çözün.');
      return;
    }
    
    await noteService.togglePin(id);
    
    // Verileri yeniden yükle ve sırala
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Personal Repositories</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📝 Notlar
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'todos'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✅ To-Do List
        </button>
      </div>

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div>
          <div className="mb-4">
            {!showNoteForm ? (
              <button
                onClick={() => setShowNoteForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                + Yeni Not
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Not Başlığı"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full mb-2 px-4 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Not İçeriği"
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full mb-2 px-4 py-2 border rounded-lg"
                  rows={4}
                />
                <input
                  type="text"
                  placeholder="Kategori (opsiyonel)"
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  className="w-full mb-2 px-4 py-2 border rounded-lg"
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

          {/* Arama */}
          <div className="mb-4 bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Arama</h3>
            <input
              type="text"
              placeholder="Not başlığı, içerik veya kategori ara..."
              value={noteSearchQuery}
              onChange={(e) => setNoteSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Henüz notunuz yok</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`border rounded-lg p-4 ${
                    note.isPinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {note.isPinned && '📌 '}
                      {note.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className="text-sm text-yellow-600 hover:text-yellow-700"
                      >
                        {note.isPinned ? 'Çöz' : 'Sabitle'}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2 whitespace-pre-wrap">{note.content}</p>
                  {note.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {note.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Todos Tab */}
      {activeTab === 'todos' && (
        <div>
          <div className="mb-4">
            {!showTodoForm ? (
              <button
                onClick={() => setShowTodoForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                + Yeni To-Do
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="To-Do Başlığı"
                  value={todoForm.title}
                  onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                  className="w-full mb-2 px-4 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Açıklama (opsiyonel)"
                  value={todoForm.description}
                  onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                  className="w-full mb-2 px-4 py-2 border rounded-lg"
                  rows={2}
                />
                <select
                  value={todoForm.priority}
                  onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full mb-2 px-4 py-2 border rounded-lg"
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
                      setTodoForm({ title: '', description: '', priority: 'medium' });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Arama */}
          <div className="mb-4 bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Arama</h3>
            <input
              type="text"
              placeholder="To-Do başlığı veya açıklama ara..."
              value={todoSearchQuery}
              onChange={(e) => setTodoSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Henüz todo'nuz yok</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`border rounded-lg p-4 flex items-start gap-3 ${
                    todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                    )}
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          todo.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : todo.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

