import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const NotFound = () => {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '404 - Sayfa Bulunamadı'
  }, [])

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0024] relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-bl from-[#2b153f] via-[#3b0000ab] to-[#0c0024] animate-gradient-shift"></div>
      
      {/* Floating Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Shape 1 */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-lg animate-blob"></div>
        
        {/* Shape 2 */}
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-lg animate-blob animation-delay-1000"></div>
        
        {/* Shape 3 */}
        <div className="absolute -bottom-32 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-lg animate-blob animation-delay-2000"></div>
        
        {/* Shape 4 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-pattern animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="text-center px-4 relative z-10">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-indigo-600 to-lime-800 animate-text-shimmer duration-100">
            404
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-white mb-4 animate-pulse duration-100">
            Sayfa Bulunamadı
          </h2>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Üzgünüz, aradığınız sayfayı bulamadık. Sayfa taşınmış veya silinmiş olabilir.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleGoHome}
            className="px-8 py-3 animate-text-shimmer bg-gradient-to-l anima from-purple-600 via-indigo-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">Ana Sayfaya Dön</span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-700  to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300 shadow-lg animate-bounce"
          >
            Geri Dön
          </button>
        </div>

        <div className="mt-16 flex justify-center animate-pulse scale-150">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500 "></div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(2);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 10px) scale(1.05);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes text-shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}

