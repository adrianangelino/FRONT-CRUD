import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, '.', '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      proxy: {
        '/user': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/events': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/ticket': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/ticket-type': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/company': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/role': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

