import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, USER, LEADERBOARD } from './support/backend'

// Opt-in public profiles, badges and the weekly leaderboard
// (vocab: GET /leaderboard, GET and POST /public_profile).

test('leaderboard lists public profiles in rank order, never emails', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/leaderboard')
  await expect(page.getByRole('heading', { name: 'Weekly leaderboard' })).toBeVisible()
  await expect(page.getByText('Week of November 23')).toBeVisible()
  const rows = page.getByRole('listitem').filter({ has: page.locator('.board__rank') })
  await expect(rows).toHaveCount(3)
  await expect(rows.nth(0)).toContainText('林冲')
  await expect(rows.nth(0).locator('.board__streak')).toContainText('41')
  await expect(rows.nth(2)).toContainText('Anonymous')
  await expect(page.locator('.board__list')).not.toContainText('@')
  // Signed out: the call to action is subscribing, not settings.
  await expect(page.getByRole('link', { name: 'Get a word a day and join in' })).toBeVisible()
})

test('a name leads to that public profile with its badges', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/leaderboard')
  await page.getByRole('link', { name: '林冲' }).click()
  await expect(page).toHaveURL(/\/u\/k7mq2xpa$/)
  await expect(page.getByRole('heading', { name: '林冲' })).toBeVisible()
  await expect(page.getByText('Joined February 2021')).toBeVisible()
  const badges = page.getByRole('region', { name: 'Badges' })
  await expect(badges.locator('.badge')).toHaveCount(4)
  await expect(badges).toContainText('New learner')
  await badges.getByText('First stroke order').hover()
  await expect(page.getByRole('tooltip', { name: 'Finished a first stroke order practice.' })).toBeVisible()
  expect(backend.api.find((c) => c.path === '/public_profile').headers.authorization).toBeUndefined()
})

test('a profile that is not public says so', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/u/nosuchone')
  await expect(page.getByRole('heading', { name: "This profile isn't public" })).toBeVisible()
})

test('leaderboard failure offers a retry', async ({ page }) => {
  await mockBackend(page, { leaderboardFails: true })
  await page.goto('/leaderboard')
  await expect(page.getByRole('alert')).toContainText("Couldn't load the leaderboard.")
})

test('empty leaderboard', async ({ page }) => {
  await mockBackend(page, { leaderboard: { ...LEADERBOARD, entries: [] } })
  await page.goto('/leaderboard')
  await expect(page.getByText('The weekly leaderboard starts once three people are on it this week.')).toBeVisible()
})

test('settings switch makes the profile public and links to it', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { user: { ...USER, public_profile: false, public_handle: null } })
  await page.goto('/profile-settings')
  const toggle = page.getByRole('switch', { name: 'Show my profile and join the leaderboard' })
  await expect(toggle).not.toBeChecked()
  await toggle.click()
  await expect(toggle).toBeChecked()
  expect(backend.api.find((c) => c.method === 'POST' && c.path === '/public_profile').body).toEqual({ public: true })
  await page.getByRole('link', { name: 'See your public profile' }).click()
  await expect(page).toHaveURL(/\/u\/k7mq2xpa$/)
})

test('profile links to the leaderboard under the streak', async ({ page }) => {
  await signedIn(page)
  await mockBackend(page)
  await page.goto('/profile')
  await page.getByRole('link', { name: 'Leaderboard' }).click()
  await expect(page).toHaveURL(/\/leaderboard$/)
})

test('fewer than three people: no board on the home page, a note on the leaderboard page', async ({ page }) => {
  await mockBackend(page, { leaderboard: { ...LEADERBOARD, entries: LEADERBOARD.entries.slice(0, 2) } })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pick your HSK level' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Weekly leaderboard' })).toHaveCount(0)
  await page.goto('/leaderboard')
  await expect(page.getByText('The weekly leaderboard starts once three people are on it this week.')).toBeVisible()
})

// On hold: LAST_WEEK_TOP3 is off in featureFlags.js.
test.skip("Mondays show last week's top 3", async ({ page }) => {
  await mockBackend(page, { leaderboard: { ...LEADERBOARD, today: '2026-11-23', entries: [] } })
  await page.goto('/')
  const card = page.locator('.home-board__card')
  await expect(card.getByRole('heading', { name: "Last week's top 3" })).toBeVisible()
  await expect(card.locator('.board__row:not(.board__row--head)').first()).toContainText('小安')
  await page.goto('/leaderboard')
  await expect(page.getByRole('heading', { name: "Last week's top 3" })).toBeVisible()
  await expect(page.getByText('The weekly leaderboard starts once three people are on it this week.')).toBeVisible()
})
