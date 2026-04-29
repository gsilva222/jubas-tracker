import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Qualquer pedido a /api/... é redirecionado para o backend
      // Assim não tens problemas de CORS em dev
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      }
    }
  }
})