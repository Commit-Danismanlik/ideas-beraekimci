import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { IRegisterDto } from '../models/Auth.model';
import { Calendar } from 'primereact/calendar';

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthContext();
  const [formData, setFormData] = useState<IRegisterDto>({
    email: '',
    password: '',
    displayName: '',
    birthDate: undefined,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [success, setSuccess] = useState(false);

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
      // Kayıt başarılı, email doğrulama mesajı göster
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial"></div>
        <div className="absolute inset-0 bg-gradient-mesh"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-strong rounded-3xl shadow-glow-lg p-8 backdrop-blur-xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <img src="/gbtalks_row.svg" alt="GBTalks Logo" className="w-full max-w-xs mx-auto mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Kayıt Ol
            </h1>
            <p className="text-indigo-300 text-lg">Yeni hesap oluşturun</p>
          </div>

          {success ? (
            <div className="mb-4 bg-green-500/20 border border-green-500/30 backdrop-blur-sm text-green-300 px-4 py-3 rounded-xl animate-fade-in-scale">
              <p className="font-semibold mb-2">Kayıt başarılı!</p>
              <p className="text-sm mb-2">
                {formData.email} adresine email doğrulama linki gönderdik. Lütfen email kutunuzu kontrol edin ve email adresinizi doğrulayın.
              </p>
              <p className="text-sm">
                Email adresinizi doğruladıktan sonra{' '}
                <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold hover:underline transition-colors">
                  giriş yapabilirsiniz
                </Link>.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-300 px-4 py-3 rounded-xl animate-fade-in-scale">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-indigo-200">
                İsim
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-400/50"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-indigo-200">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-400/50"
                placeholder="ornek@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-indigo-200">
                Şifre
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-400/50"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-indigo-200">
                Şifre Tekrar
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-400/50"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-indigo-200">
                Doğum Tarihi
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-left text-white hover:border-indigo-400 transition-all duration-200"
                >
                  {selectedDate ? selectedDate.toLocaleDateString('tr-TR') : 'Tarih seçin'}
                </button>
                
                {showDatePicker && (
                  <div className="absolute z-50 bottom-0 glass border border-indigo-500/30 rounded-xl shadow-glow w-[345px] h-[315px]">
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
                        onChange={(e: { value: Date | null }) => {
                          setSelectedDate(e.value);
                          setShowDatePicker(false);
                        }}
                        inline
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 13))} // Minimum 13 yaş
                        dateFormat="dd/mm/yy"
                        placeholder="Doğum tarihinizi seçin"
                      />
                      <div className="absolute top-1 -right-6">
                        <button onClick={() => setShowDatePicker(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all transform hover:scale-105">
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
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kayıt yapılıyor...
                </span>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-indigo-300">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

