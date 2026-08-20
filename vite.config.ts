import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // No manual chunking: three and the R3F stack ride along with the lazily imported
    // Canvas, so the shell paints without waiting on (or preloading) the renderer.
    chunkSizeWarningLimit: 1200,
  },
})
