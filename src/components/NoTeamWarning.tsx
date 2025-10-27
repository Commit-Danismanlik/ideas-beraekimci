import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getTeamService } from '../di/container';
import { ICreateTeamDto } from '../models/Team.model';

interface NoTeamWarningProps {
  onTeamChange: () => void;
}

export const NoTeamWarning = ({ onTeamChange }: NoTeamWarningProps) => {
  const { user } = useAuthContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [createFormData, setCreateFormData] = useState<ICreateTeamDto>({
    name: '',
    description: '',
  });
  const [joinTeamId, setJoinTeamId] = useState('');
  
  const teamService = getTeamService();

  const handleCreateTeam = async () => {
    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!createFormData.name.trim()) {
      setError('Takım adı boş olamaz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Takım oluşturma işlemi başlatılıyor:', createFormData);
      
      const result = await teamService.createTeam(createFormData, user.uid);

      console.log('Takım oluşturma sonucu:', result);

      if (result.success && result.data) {
        setShowCreateForm(false);
        setCreateFormData({ name: '', description: '' });
        alert(`Takım başarıyla oluşturuldu!\n\nTakım ID: ${result.data.id}\n\nBu ID'yi başkalarıyla paylaşarak takıma davet edebilirsiniz.`);
        onTeamChange();
      } else {
        setError(result.error || 'Takım oluşturulamadı');
        console.error('Takım oluşturma hatası:', result.error);
      }
    } catch (err) {
      console.error('Takım oluşturma exception:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    }

    setLoading(false);
  };

  const handleJoinTeam = async () => {
    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!joinTeamId.trim()) {
      setError('Takım ID boş olamaz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Takıma katılma işlemi başlatılıyor:', { teamId: joinTeamId, userId: user.uid });
      
      const result = await teamService.joinTeam(joinTeamId.trim(), user.uid);

      console.log('Takıma katılma sonucu:', result);

      if (result.success) {
        setShowJoinForm(false);
        setJoinTeamId('');
        alert('Takıma başarıyla katıldınız!');
        onTeamChange();
      } else {
        setError(result.error || 'Takıma katılınamadı');
        console.error('Takıma katılma hatası:', result.error);
      }
    } catch (err) {
      console.error('Takıma katılma exception:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Herhangi bir takımda değilsin
        </h2>
        <p className="text-gray-600">
          Devam etmek için bir takıma katıl veya yeni bir takım oluştur
        </p>
      </div>

      {!showCreateForm && !showJoinForm && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setShowJoinForm(true);
              setShowCreateForm(false);
              setError(null);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Takıma Katıl
          </button>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setShowJoinForm(false);
              setError(null);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Takım Oluştur
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="mt-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Yeni Takım Oluştur</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Takım Adı *
              </label>
              <input
                type="text"
                placeholder="Takım Adı"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                placeholder="Takım hakkında kısa açıklama (opsiyonel)"
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateTeam}
                disabled={loading || !createFormData.name.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({ name: '', description: '' });
                  setError(null);
                }}
                className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Form */}
      {showJoinForm && (
        <div className="mt-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Takıma Katıl</h3>
          <p className="text-sm text-gray-600 mb-3">
            Katılmak istediğiniz takımın ID'sini girin. Takım ID'sini takım sahibinden alabilirsiniz.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Takım ID
              </label>
              <input
                type="text"
                placeholder="Örn: ABC123xyz456"
                value={joinTeamId}
                onChange={(e) => setJoinTeamId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Takım ID büyük/küçük harf duyarlıdır
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleJoinTeam}
                disabled={loading || !joinTeamId.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Katılınıyor...' : 'Katıl'}
              </button>
              <button
                onClick={() => {
                  setShowJoinForm(false);
                  setJoinTeamId('');
                  setError(null);
                }}
                className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg"
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

