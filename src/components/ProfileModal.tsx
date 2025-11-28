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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale p-4">
      <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-glow-lg border border-indigo-500/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Profil Bilgileri
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-all duration-300 transform hover:scale-110"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-300 rounded-xl text-xs sm:text-sm animate-fade-in-scale">
            {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">İsim</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Email</label>
            <input
              type="email"
              value={profileForm.email}
              disabled
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-300/50 backdrop-blur-sm cursor-not-allowed bg-slate-800/30 text-sm sm:text-base"
            />
            <p className="text-xs text-indigo-300/60 mt-1 sm:mt-2">Email değiştirmek için yöneticinize başvurunuz.</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Doğum Tarihi</label>
            <input
              type="text"
              value={profileForm.birthDate ? new Date(profileForm.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
              disabled
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-300/50 backdrop-blur-sm cursor-not-allowed bg-slate-800/30 text-sm sm:text-base"
            />
            <p className="text-xs text-indigo-300/60 mt-1 sm:mt-2">Doğum tarihi değiştirilemez</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">
              Mevcut Şifre <span className="text-indigo-300/60 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="password"
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
              placeholder="Şifre değiştirmek için mevcut şifrenizi girin"
            />
            <p className="text-xs text-indigo-300/60 mt-1 sm:mt-2">
              Şifre değiştirmek istemiyorsanız boş bırakın
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Yeni Şifre</label>
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
              placeholder="En az 6 karakter"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-2">Yeni Şifre Tekrar</label>
            <input
              type="password"
              value={profileForm.confirmPassword}
              onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass border border-indigo-500/30 rounded-xl text-indigo-200 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-400/50 transition-all placeholder-indigo-300/50 text-sm sm:text-base"
              placeholder="Yeni şifrenizi tekrar girin"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </span>
            ) : (
              'Kaydet'
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 bg-gray-500/20 hover:bg-gray-600/20 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 text-sm sm:text-base"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

