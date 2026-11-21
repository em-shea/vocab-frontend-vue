import { defineConfig, devices } from '@playwright/test'

// Installable-app checks. A service worker only exists in a production build,
// so these build the site and serve it with `vite preview` instead of using
// the dev server. Run: npm run test:pwa (PW_CHANNEL=chrome on machines that
// cannot reach the Playwright CDN). Slower than the journeys; run before
// merging and after changing vite.config.js.

const PORT = 4179

export default defineConfig({
  testDir: 'tests/pwa',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.PW_CHANNEL || undefined
  },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite build --mode staging && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180000
  }
})
