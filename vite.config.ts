import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Environment değişkenlerini yükle (hem .env dosyasından hem de process.env'den)
  const env = loadEnv(mode, process.cwd(), '')
  
  // VITE_ prefix'li değişkenleri process.env'den de al
  const viteEnv = {
    ...env,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '',
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    // Environment değişkenlerini açıkça tanımla
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(viteEnv.VITE_GEMINI_API_KEY),
    },
  }
})

