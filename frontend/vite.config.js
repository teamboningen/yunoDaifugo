import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
      alias: {
        '@/components': '/src/components',
        '@/lib/utils': '/src/lib/utils',
      },
    },
  server: {
    port: 3000,
    },
})
