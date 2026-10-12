import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages is served from a sub-path. Local dev + preview use the root.
// Override at build time with:  npm run build -- --base=/your-repo/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Shereya_Portfolio/' : '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
  },
}))
