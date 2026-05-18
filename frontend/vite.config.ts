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
    // CRITICAL: Force a SINGLE React instance across all chunks.
    // Without this, manualChunks can create duplicate React copies, causing
    // "Invalid hook call" (React error #321) crashes at runtime.
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // No manualChunks — let Vite handle code splitting automatically based on
    // dynamic imports. Manual chunks were creating empty react-core / dates
    // chunks and causing duplicate React instances.
    rollupOptions: {
      output: {
        // Use deterministic chunk names so caching works well
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Force Vite to pre-bundle these deps so they all share one React copy
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
