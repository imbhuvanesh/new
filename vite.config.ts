import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves a project site under /<repo>/. This repository is `new`,
// so the production build must be emitted under /new/. Local dev and `vite
// preview` use the root, which is why the base depends on the Vite command.
// Override at build time with:  npm run build -- --base=/your-repo/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/new/' : '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
  },
}))
