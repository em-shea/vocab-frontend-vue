import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Installable app (PWA). Decided 2026-11-13: stay a website, shipped as a PWA.
//
// What the service worker keeps:
//  - the app itself (HTML, JS, CSS, icons), stored at install, so the site
//    opens instantly and its pages still load offline;
//  - fonts and images, stored the first time they are used (fonts total about
//    6.5 MB across the HSK subsets, too much to fetch up front).
// What it never keeps: anything from the API or the audio bucket. Those are
// other origins and always go to the network, so words, quizzes and the
// profile are never stale. Offline, screens show their usual load errors and
// App.vue says the reader is offline.
//
// New versions install in the background and take over on the next visit
// (registerType 'autoUpdate'). Deploys must serve sw.js and index.html
// uncached so browsers notice them (see deploy notes in the project status).
const pwa = VitePWA({
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  manifest: {
    name: 'Haohaotiantian',
    short_name: 'Haohaotiantian',
    description: 'A Chinese word a day, with quizzes and review.',
    lang: 'en',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FAF5EA',
    theme_color: '#1B2140',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{html,js,css}', 'icons/*.png'],
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/fonts/'),
        handler: 'CacheFirst',
        options: { cacheName: 'fonts', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 } }
      },
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && /\.(?:jpg|jpeg|png|webp|gif)$/.test(url.pathname),
        handler: 'CacheFirst',
        options: { cacheName: 'images', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 } }
      }
    ]
  },
  // Off while developing: a service worker on the dev server caches stale code.
  devOptions: { enabled: false }
})


export default defineConfig({
  plugins: [vue(), pwa],
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
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    restoreMocks: true
  }
})
