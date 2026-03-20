import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // Proxy n8n webhook calls in development to avoid CORS issues.
      // In production (Vercel), requests go directly to n8n (CORS is allowed there).
      '/api/n8n': {
        target: 'https://prepflow.app.n8n.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, '/webhook/prepflow'),
        secure: true,
      },
    },
  },
})
