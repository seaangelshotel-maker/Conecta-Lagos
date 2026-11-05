import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 🔒 Nenhuma chave secreta é injetada no JavaScript público.
// A chave do Gemini fica apenas no servidor (GEMINI_API_KEY) e é usada em /api/ai/generate.
// Somente variáveis com prefixo VITE_ chegam ao navegador (ex.: VITE_FIREBASE_*).
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
})
