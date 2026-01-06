import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/events': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/ticket': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

