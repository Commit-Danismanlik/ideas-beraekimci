import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getUserService } from '../di/container';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user } = useAuthContext();
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    email: '', 
    birthDate: undefined as Date | undefined,
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userService = getUserService();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const userResult = await userService.getUserById(user.uid);
        if (userResult.success && userResult.data) {
          setProfileForm({
            name: userResult.data.name || '',
            email: userResult.data.email || '',
            birthDate: userResult.data.birthDate,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      }
    };
    fetchUserData();
  }, [user, userService]);

  const handleUpdateProfile = async () => {
    setError(null);
    setLoading(true);

    try {
      // Yeni şifre girildiyse mevcut şifre kontrolü yap
      if (profileForm.newPassword) {
        if (!profileForm.currentPassword) {
          setError('Şifre değiştirmek için mevcut şifrenizi girin');
          setLoading(false);
          return;
        }

        if (profileForm.newPassword.length < 6) {
          setError('Yeni şifre en az 6 karakter olmalıdır');
          setLoading(false);
          return;
        }

        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setError('Yeni şifreler eşleşmiyor');
          setLoading(false);
          return;
        }

        // Mevcut şifreyi doğrula ve şifreyi güncelle
        if (user?.email) {
          const auth = getAuth();
          const credential = EmailAuthProvider.credential(
            user.email,
            profileForm.currentPassword
          );

          // Re-authenticate
          await reauthenticateWithCredential(auth.currentUser!, credential);
          // Update password
          await updatePassword(auth.currentUser!, profileForm.newPassword);
        }
      }

      // Profil bilgilerini güncelle
      if (user?.uid) {
        const updateResult = await userService.updateUser(user.uid, {
          name: profileForm.name
        });

        if (updateResult.success) {
          onClose();
        } else {
          setError(updateResult.error || 'Profil güncellenemedi');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Profil Bilgileri</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profileForm.email}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email değiştirmek için yöneticinize başvurunuz.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
            <input
              type="text"
              value={profileForm.birthDate ? new Date(profileForm.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Doğum tarihi değiştirilemez</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut Şifre <span className="text-gray-500">(opsiyonel)</span>
            </label>
            <input
              type="password"
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Şifre değiştirmek için mevcut şifrenizi girin"
            />
            <p className="text-xs text-gray-500 mt-1">
              Şifre değiştirmek istemiyorsanız boş bırakın
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="En az 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre Tekrar</label>
            <input
              type="password"
              value={profileForm.confirmPassword}
              onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Yeni şifrenizi tekrar girin"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

