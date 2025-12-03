import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  
  const env = loadEnv(mode, process.cwd(), '')
  
 
  const viteEnv = {
    ...env,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '',
    VITE_CHATBOT_MAINTENANCE_MODE: process.env.VITE_CHATBOT_MAINTENANCE_MODE || env.VITE_CHATBOT_MAINTENANCE_MODE || '',
  }
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },

    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(viteEnv.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_CHATBOT_MAINTENANCE_MODE': JSON.stringify(viteEnv.VITE_CHATBOT_MAINTENANCE_MODE),
    },
  }
})

