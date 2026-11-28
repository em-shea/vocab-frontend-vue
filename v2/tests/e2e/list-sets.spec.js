import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, userActivity, USER, HSK1, HSK2 } from './support/backend'

// Lists in both character sets (Emily, 2026-11-27): each word follows its
// list's set on every page, and list names carry 简 / 繁.
const MIXED = [
  { list_id: HSK1, list_name: 'HSK Level 1', character_set: 'simplified', status: 'subscribed' },
  { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'traditional', status: 'subscribed' }
]

test.beforeEach(async ({ page }) => { await signedIn(page) })

test('stroke order marks each list 简 or 繁', async ({ page }) => {
  await mockBackend(page, { user: { ...USER, subscriptions: MIXED }, userActivity: userActivity({ subscriptions: MIXED }) })
  await page.goto('/write')
  await expect(page.getByText('HSK Level 1 简')).toBeVisible()
})

test('sentences show a traditional list in traditional characters', async ({ page }) => {
  await mockBackend(page, { user: { ...USER, subscriptions: MIXED }, userActivity: userActivity({ subscriptions: MIXED }) })
  await page.goto('/sentences')
  await expect(page.locator('.write__characters', { hasText: '幫助' })).toBeVisible()
  await expect(page.locator('.write__characters', { hasText: '帮助' })).toHaveCount(0)
  await expect(page.locator('.write__characters', { hasText: '爱护' })).toBeVisible()
})

test('the profile sentences box follows each list too', async ({ page }) => {
  await mockBackend(page, { user: { ...USER, subscriptions: MIXED }, userActivity: userActivity({ subscriptions: MIXED }) })
  await page.goto('/profile')
  await expect(page.locator('.sentences__word', { hasText: '爱护' })).toBeVisible()
})

test('中文 mode sets the page language, so small labels are enlarged', async ({ page }) => {
  await mockBackend(page, { user: { ...USER, 'Language preference': 'cn' }, userActivity: { ...userActivity(), 'Language preference': 'cn' } })
  await page.goto('/profile')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
  const size = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--t-sm').trim())
  expect(size).toBe('0.875rem')
})
