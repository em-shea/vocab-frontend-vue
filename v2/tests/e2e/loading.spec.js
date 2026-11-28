import { test, expect } from '@playwright/test'
import { mockBackend, signedIn } from './support/backend'

// The loading 好 is clipped stroke by stroke. Hanzi Writer writes the page
// address into each clip reference; the quiz rewrites its address while
// loading, which left the moving stroke unclipped (a fat line) on phones.
test('loader stroke clips survive the quiz rewriting its address', async ({ page }) => {
  await mockBackend(page)
  await signedIn(page)
  await page.route(/^https:\/\/api\.(staging\.)?haohaotiantian\.com\//, async (route) => {
    await new Promise((r) => setTimeout(r, 4000))
    await route.fallback()
  })
  await page.goto('/quiz')
  const loader = page.locator('.loading__char')
  await expect(loader.locator('svg')).toHaveCount(1)
  await page.evaluate(() => window.history.replaceState(window.history.state, '', window.location.pathname + '?x=1'))
  await page.waitForTimeout(100)
  // Make the app notice an address change the way the quiz does.
  await page.evaluate(() => document.querySelector('#app').__vue_app__.config.globalProperties.$router.replace({ query: { list_id: 'z' } }))
  await expect.poll(async () => loader.evaluate((el) =>
    [...el.querySelectorAll('[clip-path], [mask]')].map((n) => n.getAttribute('clip-path') || n.getAttribute('mask')))
  ).toEqual(expect.arrayContaining([expect.stringMatching(/^url\(#/)]))
  const absolute = await loader.evaluate((el) =>
    [...el.querySelectorAll('[clip-path], [mask]')].filter((n) => /url\("?http/.test(n.getAttribute('clip-path') || n.getAttribute('mask'))).length)
  expect(absolute).toBe(0)
})
