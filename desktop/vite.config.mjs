import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;
const localPath = path => fileURLToPath(new URL(path, import.meta.url));
const pkg = JSON.parse(readFileSync(localPath('./package.json'), 'utf8'));

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: [
      { find: 'three/addons', replacement: localPath('./node_modules/three/examples/jsm') },
      { find: 'three', replacement: localPath('./node_modules/three/build/three.module.js') },
    ],
  },
  clearScreen: false,
  server: {
    port: 1424,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1425 } : undefined,
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), localPath('../')] },
    watch: { ignored: ['**/src-tauri/**'] },
  },
});
