import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { IPasswordResetDto } from '../models/Auth.model';

export const ForgotPassword = () => {
  const { sendPasswordResetEmail, loading, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    const dto: IPasswordResetDto = {
      email: email.trim(),
    };
    
    const result = await sendPasswordResetEmail(dto);
    
    if (result.success) {
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
              Şifremi Unuttum
            </h1>
            <p className="text-indigo-300 text-lg">Şifre sıfırlama linki göndereceğiz</p>
          </div>

          {success ? (
            <div className="mb-4 bg-green-500/20 border border-green-500/30 backdrop-blur-sm text-green-300 px-4 py-3 rounded-xl animate-fade-in-scale">
              <p className="font-semibold mb-2">Email gönderildi!</p>
              <p className="text-sm">
                {email} adresine şifre sıfırlama linki gönderdik. Lütfen email kutunuzu veya spam klasörünü kontrol edin.
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
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-400/50"
                    placeholder="ornek@email.com"
                  />
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
                      Gönderiliyor...
                    </span>
                  ) : (
                    'Şifre Sıfırlama Linki Gönder'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-indigo-300">
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors">
                ← Giriş sayfasına dön
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


