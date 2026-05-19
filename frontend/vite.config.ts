import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  // optimizeDeps helps in DEV. manualChunks fixes the TDZ crash in PRODUCTION.
  // motion v12 has an ESM module ordering issue — bundling it as its own chunk
  // ensures it fully initialises before any component that imports from it.
  optimizeDeps: {
    include: ['motion/react', 'motion'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-motion': ['motion/react'],
          'vendor-react':  ['react', 'react-dom'],
        },
      },
    },
  },
});
