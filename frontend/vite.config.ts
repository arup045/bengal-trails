import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// MINIMAL Vite config — no manual chunks, no forced dedup, no preBundle override.
// Vite's defaults are tuned for React apps; overriding them causes more
// problems than they solve (duplicate React, "Invalid hook call" #321, etc.)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
