import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => ({
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
    include: ['motion/react', 'motion', 'recharts'],
  },
  // Strip console.log + console.debug + debugger in production. Keep console.warn
  // and console.error so Sentry's breadcrumb capture still works.
  esbuild: mode === 'production' ? {
    drop: ['debugger'],
    pure: ['console.log', 'console.debug', 'console.trace', 'console.info'],
  } : undefined,
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-motion':   ['motion/react'],
          'vendor-react':    ['react', 'react-dom'],
          // Recharts has the same ESM module-ordering issue as motion. Bundling
          // it as its own chunk ensures ResponsiveContainer & friends fully
          // initialise before AdminDashboard / AnalyticsDashboard load.
          'vendor-recharts': ['recharts'],
          // Sanitization runs on every blog/AI render — keep it in its own chunk
          // so it's cached separately across deploys.
          'vendor-sanitize': ['isomorphic-dompurify'],
        },
      },
    },
  },
}));
