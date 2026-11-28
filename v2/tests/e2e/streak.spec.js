import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, userActivity, streakFixture, USER } from './support/backend'

// The streak card at the top of the profile (GET /progress, streak).
const progress = (streak) => ({ lists: [], proficient_rule: {}, streak })

test.beforeEach(async ({ page }) => { await signedIn(page) })

test('shows the streak, the last 7 days and spare days', async ({ page }) => {
  await mockBackend(page, { userActivity: userActivity(), progress: progress(streakFixture()) })
  await page.goto('/profile')
  const card = page.getByRole('region', { name: /4\s*day streak/ })
  await expect(card).toBeVisible()
  const days = card.getByRole('list', { name: 'The last 7 days' }).getByRole('listitem')
  await expect(days).toHaveCount(7)
  // A day covered by a buffer day reads as practiced, with the same check.
  await expect(days.nth(3)).toContainText('practiced')
  await expect(card.locator('.streak__mark--saved')).toHaveCount(0)
  await expect(days.nth(6)).toContainText('not done yet')
  await expect(card.getByLabel('2 of 3 buffer days saved')).toBeVisible()
  await expect(card.getByText('Best: 12 days')).toBeVisible()

  // One explanation, at the bottom.
  await card.getByRole('button', { name: 'How streaks work' }).click()
  await expect(card.getByRole('tooltip')).toBeVisible()
  await expect(card.getByRole('tooltip')).toContainText('A buffer day covers a day you miss')
})

test('no card when progress fails to load', async ({ page }) => {
  await mockBackend(page, { userActivity: userActivity(), progressFails: true })
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: /Today's words?/ })).toBeVisible()
  await expect(page.getByText(/day streak/)).toHaveCount(0)
})

test('reads in Chinese', async ({ page }) => {
  // The profile follows the account's language.
  await mockBackend(page, { user: { ...USER, 'Language preference': 'cn' }, userActivity: { ...userActivity(), 'Language preference': 'cn' }, progress: progress(streakFixture()) })
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: /连续\s*4\s*天/ })).toBeVisible()
  await expect(page.getByText('备用天数', { exact: true })).toBeVisible()
})
