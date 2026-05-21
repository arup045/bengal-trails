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
  // Pre-bundle these CJS/ESM-mixed packages so Vite resolves their named
  // exports correctly in both dev and prod.
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
    chunkSizeWarningLimit: 1500,
    commonjsOptions: {
      // Recharts ships some CJS-style internals — let the plugin
      // hoist their imports so named exports always resolve.
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Function-form manualChunks: ensures recharts AND its deep
        // dependencies (d3-shape, d3-scale, victory-vendor, etc.) all land
        // in the SAME chunk so named exports cannot deadlock at runtime.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('motion'))        return 'vendor-motion';
            if (id.includes('recharts')
             || id.includes('victory')
             || id.includes('d3-shape')
             || id.includes('d3-scale')
             || id.includes('d3-array')
             || id.includes('d3-time'))       return 'vendor-recharts';
            if (id.includes('isomorphic-dompurify')
             || id.includes('dompurify'))     return 'vendor-sanitize';
            if (id.includes('react-dom')
             || id.includes('/react/')
             || id.includes('scheduler'))     return 'vendor-react';
          }
        },
      },
    },
  },
}));
