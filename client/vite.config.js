import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output to dist/ at the project root (one level up from client/)
    // This ensures Vercel finds the build regardless of output directory setting
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
})
