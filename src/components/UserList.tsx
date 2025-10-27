import { useEffect, useState } from 'react';
import { IUser } from '../models/User.model';
import { useUserService } from '../hooks/useUserService';

export const UserList = () => {
  const { getAllUsers, deleteUser, loading, error } = useUserService();
  const [users, setUsers] = useState<IUser[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
    };

    fetchUsers();
  }, [getAllUsers, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      const result = await deleteUser(id);
      if (result.success) {
        setRefreshTrigger((prev) => prev + 1);
      }
    }
  };

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
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
          {users.length} Kullanıcı
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Henüz kullanıcı bulunmuyor</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-200">
                    {user.name}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.age && (
                    <p className="text-sm text-gray-500 mt-1">Yaş: {user.age}</p>
                  )}
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
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
          ))}
        </div>
      )}
    </div>
  );
};

