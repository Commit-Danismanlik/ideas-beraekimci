import { useState, FormEvent } from 'react';
import { ICreateUserDto } from '../../models/User.model';
import { useUserService } from '../../hooks/useUserService';

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { createUser, loading, error } = useUserService();
  const [formData, setFormData] = useState<ICreateUserDto>({
    name: '',
    email: '',
    age: undefined,
    isActive: true,
  });
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    const result = await createUser(formData);
    
    if (result.success) {
      setSuccessMessage('Kullanıcı başarıyla oluşturuldu!');
      setFormData({
        name: '',
        email: '',
        age: undefined,
        isActive: true,
      });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Yeni Kullanıcı Oluştur
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            İsim *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 bg-gray-900 text-indigo-200  "
            placeholder="Kullanıcı adı"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 bg-gray-900 text-indigo-200"
            placeholder="ornek@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yaş
          </label>
          <input
            type="number"
            min="0"
            max="150"
            value={formData.age || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                age: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 bg-gray-900 text-indigo-200"
            placeholder="Yaş (opsiyonel)"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Aktif kullanıcı
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
        </button>
      </form>
    </div>
  );
};

