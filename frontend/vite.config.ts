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
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React + router — loaded on every page
          'react-core': ['react', 'react-dom'],
          // Animation lib — used on most pages
          'motion': ['motion'],
          // UI component library
          'radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
          ],
          // Charts — only loaded on analytics pages
          'charts': ['recharts'],
          // Query client
          'query': ['@tanstack/react-query'],
          // Date utils
          'dates': ['date-fns'],
          // Form validation
          'forms': ['react-hook-form', 'zxcvbn'],
        },
      },
    },
  },
});
