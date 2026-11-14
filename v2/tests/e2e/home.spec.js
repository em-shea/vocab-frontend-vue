import { test, expect } from '@playwright/test'
import { mockBackend, HSK1 } from './support/backend'

// The home page shipped in Phase 3 without tests. These pin what it already
// does, so later phases cannot quietly break subscribing.

test('shows real sample words for each level', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')
  await expect(page.getByText('爱护').first()).toBeVisible()
  await expect(page.getByText('to cherish').first()).toBeVisible()
})

test('a new visitor subscribes to a level', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/')

  const form = page.locator('form').first()
  await expect(form.getByRole('combobox')).toHaveValue(HSK1)
  await form.getByRole('textbox').fill('new@example.com')
  await form.getByRole('button').click()

  await expect(form.getByRole('status')).toContainText('Check your inbox')
  expect(backend.cognito).toEqual(['SignUp'])
  const call = backend.api.find((c) => c.path === '/set_subs')
  expect(call.body).toMatchObject({
    cognito_id: 'sub-new',
    email: 'new@example.com',
    subscriptions: [{ list_id: HSK1, list_name: 'HSK Level 1' }]
  })
})

test('an address that is already subscribed is pointed at sign-in, not told it worked', async ({ page }) => {
  const backend = await mockBackend(page, { existingUser: true })
  await page.goto('/')

  const form = page.locator('form').first()
  await form.getByRole('textbox').fill('old@example.com')
  await form.getByRole('button').click()

  await expect(form.getByRole('status')).toContainText('already subscribed')
  expect(backend.api.some((c) => c.path === '/set_subs')).toBe(false)
})

test('switching to traditional characters changes the study content', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?char=traditional')
  await expect(page.getByText('愛護').first()).toBeVisible()
})

test('the subscribe form is visible without scrolling on a phone', async ({ page }) => {
  await mockBackend(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const form = page.locator('form').first()
  await expect(form.getByRole('button', { name: /subscribe/i })).toBeInViewport({ ratio: 1 })
  await expect(form.getByRole('textbox')).toBeInViewport({ ratio: 1 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('every woodblock print has a source credit', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')

  const figures = page.locator('figure').filter({ has: page.locator('img[src*="prints"], .print__img, .oath__board img') })
  const count = await figures.count()
  expect(count).toBeGreaterThanOrEqual(3)
  for (let i = 0; i < count; i++) {
    const caption = figures.nth(i).locator('figcaption')
    await expect(caption).toContainText('Utagawa Kuniyoshi')
    await expect(caption).toContainText('One Hundred and Eight Heroes of the Popular Water Margin')
    await expect(caption).toContainText('Public domain')
  }
  // No print is left without a figcaption, whatever its source path.
  expect(await page.locator('img.print__img').count()).toBe(await page.locator('figure.print > figcaption').count())
})

test('shows an example of the daily email', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')

  const mail = page.getByRole('figure', { name: 'Example of the daily email' })
  await expect(mail).toContainText("Today's word: 爱护")
  await expect(mail).toContainText('我们要爱护环境。')
  await expect(mail).toContainText('Wǒmen yào àihù huánjìng.')
  await expect(mail).toContainText('We should take care of the environment.')
})

test('unbuilt features say "Launching soon", and nothing leads to the upload page', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')

  // Catalogue, upload, sentences, writing and quests.
  await expect(page.getByText('Launching soon', { exact: true })).toHaveCount(5)
  await expect(page.locator('a[href*="manage-lists"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /upload/i })).toHaveCount(0)
})
