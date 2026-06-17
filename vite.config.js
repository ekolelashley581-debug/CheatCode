import { defineConfig } from 'vite';
export default defineConfig({
    root: '.',
    publicDir: 'public',
    server: { port: 2370, open: false, hmr: false },
    optimizeDeps: { include: ['dexie', 'marked', 'three', 'pdfjs-dist'] }
});