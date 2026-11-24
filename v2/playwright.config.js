import { defineConfig, devices } from '@playwright/test'

// User-journey tests. They drive the real app in a real browser, with Cognito
// and the API replaced by the stand-ins in tests/e2e/support/backend.js, so
// they are fast, need no credentials and never email anyone.
//
// PW_CHANNEL=chrome uses an installed Chrome instead of Playwright's download,
// for machines that cannot reach the Playwright CDN.

const PORT = 5179

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: process.env.PW_CHANNEL || undefined
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1120, height: 900 } } }
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // A stand-in public key so the notifications toggle shows (tests/e2e/push.spec.js).
    env: { VITE_VAPID_PUBLIC_KEY: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' }
  }
})
