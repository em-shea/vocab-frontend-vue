import { test, expect } from '@playwright/test'
import { mockBackend } from '../e2e/support/backend'

// The site as an installable app: manifest, icons, service worker, offline.

test('has a manifest an app can be installed from', async ({ page, request }) => {
  await page.goto('/')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  const manifest = await (await request.get(href)).json()
  expect(manifest).toMatchObject({ name: 'Haohaotiantian', display: 'standalone', start_url: '/', theme_color: '#FAF5EA' })
  const sizes = manifest.icons.map((i) => i.sizes)
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
  expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true)
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok(), icon.src).toBe(true)
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png')
})

test('a service worker takes charge of the site', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)
  expect(scope).toMatch(/^http:\/\/localhost:\d+\/$/)
})

test('offline, pages still open and say why words will not load', async ({ page, context }) => {
  await mockBackend(page)
  await page.goto('/')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  // The first load installs the worker; reload so it controls the page.
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.goto('/review')
  await expect(page.getByRole('navigation').first()).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: "You're offline." })).toBeVisible()

  await context.setOffline(false)
  await expect(page.getByText("You're offline.")).toHaveCount(0)
})

test('API answers are never served from the cache', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  const cached = await page.evaluate(async () => {
    const urls = []
    for (const name of await caches.keys()) {
      const cache = await caches.open(name)
      for (const req of await cache.keys()) urls.push(req.url)
    }
    return urls
  })
  expect(cached.length).toBeGreaterThan(0)
  expect(cached.filter((u) => !u.startsWith(new URL(page.url()).origin))).toEqual([])
})
