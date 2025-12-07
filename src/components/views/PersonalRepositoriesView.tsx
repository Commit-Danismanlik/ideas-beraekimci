import ReactMarkdown from 'react-markdown';
import { usePersonalRepositories } from '../../hooks/usePersonalRepositories';

export const PersonalRepositoriesView = () => {
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
  } = usePersonalRepositories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Personal Repositories</h2>
      </div>

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
          <div className="mb-4">
            {!showNoteForm ? (
              <button
                onClick={openNoteForm}
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
                    onClick={closeNoteForm}
                    className="bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>

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
              <p className="text-xl font-bold text-indigo-200">Henüz notunuz yok</p>
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
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                        title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                      >
                        {note.isPinned ? '🔓' : '📌'}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-indigo-200/80 mb-3 whitespace-pre-wrap h-40 overflow-y-auto">{note.content}</p>
                  {note.category && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl mb-3">
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
                onClick={openTodoForm}
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
                  placeholder="Açıklama (opsiyonel) - Markdown desteği: **kalın**, _italik_"
                  value={todoForm.description}
                  onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                  className="w-full mb-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-slate-800/50 text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50"
                  rows={2}
                />
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
                    onClick={closeTodoForm}
                    className="bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>

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
              <p className="text-xl font-bold text-indigo-200">Henüz todo'nuz yok</p>
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
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="w-6 h-6 rounded-lg border-2 border-indigo-500/50 bg-slate-800/50 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-purple-600 checked:border-transparent transition-all duration-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold ${todo.completed ? 'line-through text-indigo-300/50' : 'text-indigo-100'
                        }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <div className="text-sm text-indigo-200/70 mt-1 prose prose-invert prose-indigo max-w-none prose-sm">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-indigo-100">{children}</strong>,
                            em: ({ children }) => <em className="italic text-indigo-200">{children}</em>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-200 text-xs">{children}</code>
                              ) : (
                                <code className={className}>{children}</code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre className="bg-indigo-900/50 p-2 rounded-lg overflow-x-auto mb-1 text-xs">
                                {children}
                              </pre>
                            ),
                            ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5 text-xs">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5 text-xs">{children}</ol>,
                          }}
                        >
                          {todo.description}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className="mt-2">
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
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title="Sil"
                  >
                    🗑️
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

