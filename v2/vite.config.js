import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // amazon-cognito-identity-js pulls in the `buffer` package, which expects
  // Node's `global`. Webpack shimmed that automatically, so the Vue 2 app never
  // needed this; Vite does not, and without it the SDK throws
  // "ReferenceError: global is not defined" at import time and the app renders
  // a blank page.
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    // Source maps are not emitted: the Vue 2 build ships 52 .map files to the
    // prod bucket, which publishes the whole frontend source. No reason to
    // repeat that here.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Fonts are large and immutable; keeping them on a stable path with
        // hashed filenames lets them cache indefinitely.
        assetFileNames: (info) => {
          if (/\.(woff2?|ttf)$/.test(info.name ?? '')) {
            return 'fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  server: {
    port: 5173
  }
})
