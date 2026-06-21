import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'src/main/index.ts',
      },
      preload: {
        input: path.join(__dirname, 'src/preload/index.ts'),
        // Rollup's default [name] comes from the input file's basename
        // (src/preload/index.ts -> "index"), which collides in spirit with
        // src/main/index.ts and doesn't match the literal "preload.*" path
        // hardcoded in src/main/index.ts. Name it explicitly.
        //
        // Also force a .cjs extension so the preload script is always
        // loaded as CommonJS, regardless of the project's "type": "module".
        // Electron packages this file inside app.asar, and Node's ESM
        // loader (used for .mjs) cannot resolve modules from inside an
        // asar archive, unlike the CJS loader's asar-aware require().
        vite: {
          build: {
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: 'preload.cjs',
                chunkFileNames: 'preload.cjs',
              },
            },
            rolldownOptions: {
              output: {
                format: 'cjs',
                entryFileNames: 'preload.cjs',
                chunkFileNames: 'preload.cjs',
              },
            },
          },
        },
      },
    }),
  ],
});
