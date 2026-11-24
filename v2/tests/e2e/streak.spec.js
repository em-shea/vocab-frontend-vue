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
  await expect(card.getByText('Do a quiz, sentence or stroke order practice today to keep it going.')).toBeVisible()
  const days = card.getByRole('list', { name: 'The last 7 days' }).getByRole('listitem')
  await expect(days).toHaveCount(7)
  await expect(days.nth(3)).toContainText('covered by a spare day')
  await expect(days.nth(6)).toContainText('not done yet')
  await expect(card.getByLabel('2 of 3 spare days saved')).toBeVisible()
  await expect(card.getByText('Best: 12 days')).toBeVisible()
})

test('says when today is done, and invites a start with no streak', async ({ page }) => {
  await mockBackend(page, { userActivity: userActivity(), progress: progress(streakFixture(undefined, { today_done: true })) })
  await page.goto('/profile')
  await expect(page.getByText('Done for today.', { exact: false })).toBeVisible()

  await mockBackend(page, { userActivity: userActivity(), progress: progress(streakFixture(['missed', 'missed', 'missed', 'missed', 'missed', 'missed', 'open'], { current: 0, buffer: 0, best: 0 })) })
  await page.reload()
  await expect(page.getByText('Do a quiz, sentence or stroke order practice to start a streak.')).toBeVisible()
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
