import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'sw.js',
          dest: ''
        },
        {
          src: 'manifest.json',
          dest: ''
        }
      ]
    })
  ],
  define: {
    // Polyfill process.env for legacy compatibility if needed, 
    // though we updated supabaseClient to be safe.
    'process.env': {}
  }
});