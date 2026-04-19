import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/city-of-agents/',
  build: { outDir: 'dist', rollupOptions: { input: 'index.html' } },
  test: { environment: 'node' },
  server: {
    proxy: {
      '/nvidia-api': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/nvidia-api/, ''),
      },
    },
  },
})
