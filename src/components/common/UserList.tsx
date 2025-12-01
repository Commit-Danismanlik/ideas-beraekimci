import { useEffect, useMemo, useState } from 'react';
import { IUser } from '../../models/User.model';
import { useUserService } from '../../hooks/useUserService';
import { useDebounce } from '../../hooks/useDebounce';
import { MemoizedVirtualizedList } from './VirtualizedList';

export const UserList = () => {
  const { getAllUsers, deleteUser, loading, error } = useUserService();
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState<string>('');
  const debounced = useDebounce(search, 250);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      const result = await deleteUser(id);
      if (result.success) {
        // Optimistik olarak listeden çıkar
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, debounced]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Hata:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Kullanıcı Listesi</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="İsim veya e‑posta ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500"
          />
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
            {filteredUsers.length} / {users.length}
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-500 text-lg">Henüz kullanıcı bulunmuyor</p>
        </div>
      ) : (
        <MemoizedVirtualizedList
          items={filteredUsers}
          itemKey={(u) => u.id}
          itemHeight={84}
          height={Math.min(640, Math.max(320, filteredUsers.length * 84))}
          className=""
          renderItem={(user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-200">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.age && <p className="text-sm text-gray-500 mt-1">Yaş: {user.age}</p>}
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Sil
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

