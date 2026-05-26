
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis do arquivo .env ou do painel da Vercel
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: '/', 
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // Esta linha é CRUCIAL: ela substitui "process.env.API_KEY" no seu código
      // pelo valor real da chave durante a construção do site.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
