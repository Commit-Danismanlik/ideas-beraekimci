import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { IRegisterDto } from '../models/Auth.model';
import { Calendar } from 'primereact/calendar';

export const Register = () => {
  const navigate = useNavigate();
  const { register, login, loading, error } = useAuthContext();
  const [formData, setFormData] = useState<IRegisterDto>({
    email: '',
    password: '',
    displayName: '',
    birthDate: undefined,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      alert('Şifreler eşleşmiyor');
      return;
    }

    // Kayıt işlemi (birthDate'i ekle)
    const registerData: IRegisterDto = {
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName,
      birthDate: selectedDate || undefined,
    };

    const registerResult = await register(registerData);

    if (registerResult.success) {
      // Kayıt başarılıysa otomatik login
      const loginResult = await login({
        email: formData.email,
        password: formData.password,
      });

      if (loginResult.success) {
        // Dashboard'a yönlendir
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Kayıt Ol</h1>
            <p className="text-gray-600">Yeni hesap oluşturun</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İsim
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Tekrar
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doğum Tarihi
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left hover:border-indigo-500"
                >
                  {selectedDate ? selectedDate.toLocaleDateString('tr-TR') : 'Tarih seçin'}
                </button>
                
                {showDatePicker && (
                  <div className="absolute z-50 bottom-0  bg-white border rounded-lg shadow-xl w-[345px] h-[315px]">
                    <style>{`
                      .custom-calendar {
                        transform: scale(0.85);
                        transform-origin: top center;
                        max-width: full !important;
                      }
                      .custom-calendar .p-calendar {
                        width: 100% !important;
                      }
                      .custom-calendar .p-datepicker {
                        width: 100% !important;
                      }
                      .custom-calendar .p-datepicker-table {
                        font-size: 12px !important;
                      }
                      .custom-calendar td {
                        padding: 4px !important;
                      }
                      .custom-calendar th {
                        padding: 4px !important;
                      }
                    `}</style>
                    <div className="custom-calendar">
                      <Calendar
                        value={selectedDate}
                        onChange={(e: any) => {
                          setSelectedDate(e.value as Date | null);
                          setShowDatePicker(false);
                        }}
                        inline
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 13))} // Minimum 13 yaş
                        dateFormat="dd/mm/yy"
                        placeholder="Doğum tarihinizi seçin"
                      />
                      <div className="absolute top-1 -right-6">
                        <button onClick={() => setShowDatePicker(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
                          x
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

