import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  ssr: {
    // Bundle React and the router into dist/server so the Vercel function does not resolve them
    // from node_modules: react-router picks index.mjs or index.js by the "module-sync" condition,
    // and Vercel's tracer and runtime disagree on it (ERR_MODULE_NOT_FOUND). jsdom, behind
    // isomorphic-dompurify, cannot be bundled and stays external.
    noExternal: true,
    external: ['isomorphic-dompurify'],
  },
  build: {
    manifest: true,
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) return 'vendor';
          if (id.includes('/server/data/vortex.json')) return 'content';
          if (id.includes('/locales/privacy/') || id.includes('/locales/integrations/')) return 'page-translations';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});
