import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for Vault SPA.
 * - Enables React fast refresh
 * - Supports TypeScript and Tailwind CSS
 * - SPA routing for client-side navigation
 * - Optimized build output
 */
export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh and improved JSX transform
      fastRefresh: true,
      jsxImportSource: undefined,
    }),
  ],
  resolve: {
    alias: {
      // Path aliases for cleaner imports
      'src': path.resolve(__dirname, 'src'),
      'public': path.resolve(__dirname, 'public'),
    },
  },
  css: {
    // Tailwind CSS and PostCSS handled via postcss.config.js
    preprocessorOptions: {
      // Add custom options if needed (e.g., for SCSS)
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize for SPA: single entry point
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        // Ensure hashed filenames for cache busting
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    // SPA fallback: always serve index.html for unknown routes
    fs: {
      strict: true,
    },
    // Vite handles HMR and static assets
  },
  // Enable SPA fallback for preview mode as well
  preview: {
    port: 4173,
    open: true,
  },
});