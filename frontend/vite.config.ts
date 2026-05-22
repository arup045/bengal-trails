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
        // Function-form manualChunks.
        //
        // IMPORTANT: splitting interdependent libraries across multiple chunks
        // can produce a non-deterministic "Cannot access 'X' before initialization"
        // TDZ at runtime (a cross-chunk circular-init that only triggers under
        // certain chunk load orders — exactly what crashed /explore in production).
        // To make that class of bug impossible we keep all the interdependent UI
        // libraries together in ONE `vendor` chunk, and only carve out chunks that
        // are fully self-contained leaves:
        //   - recharts + ALL its chart deps (d3-*, victory, internmap) → its own
        //     chunk. It's only used by the lazy admin route, and grouping every
        //     transitive dep prevents a recharts↔d3 cross-chunk cycle.
        //   - zxcvbn → left to its own dynamic chunk (only the signup password
        //     meter imports it, lazily), so it never weighs down the initial load.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('zxcvbn')) return; // keep lazy (dynamic import only)
          if (/[\\/](recharts|recharts-scale|victory-vendor|internmap|d3-[a-z-]+)[\\/]/.test(id)) {
            return 'vendor-recharts';
          }
          return 'vendor';
        },
      },
    },
  },
}));
