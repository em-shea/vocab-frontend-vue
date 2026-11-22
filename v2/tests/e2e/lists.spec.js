import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, watchForErrors, HSK1, HSK2, EMAIL } from './support/backend'

// Choosing which lists the daily email carries, and in which character set.
// Every change is saved straight away with POST /subscriptions, which replaces
// the account's whole set (vocab: update_subscriptions/app.py).

const USER = {
  email_address: EMAIL,
  character_set_preference: 'simplified',
  language_preference: 'en',
  subscriptions: [
    { list_id: HSK1, list_name: 'HSK Level 1', unique_list_id: `${HSK1}#SIMPLIFIED`, character_set: 'simplified', status: 'subscribed', date_subscribed: '2026-01-01' }
  ]
}

const mine = (page) => page.getByRole('region', { name: 'Subscribed' })
const more = (page) => page.getByRole('region', { name: 'More lists' })

test('a subscriber adds a list and drops one, each saved as they go', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { user: USER })
  const problems = watchForErrors(page)
  await page.goto('/manage-lists')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your lists')
  await expect(mine(page).getByRole('listitem')).toHaveCount(1)
  await expect(mine(page)).toContainText('HSK Level 1')
  // The same list in the other character set is still on offer.
  await expect(more(page).getByRole('listitem')).toHaveCount(11)
  await expect(more(page).getByRole('button', { name: 'Subscribe to HSK Level 1, Traditional' })).toBeVisible()

  await more(page).getByRole('button', { name: 'Subscribe to HSK Level 2, Simplified' }).click()
  await expect(page.getByRole('status')).toHaveText('Subscribed to HSK Level 2, Simplified.')
  await expect(mine(page).getByRole('listitem')).toHaveCount(2)
  // Focus follows the list to its new place.
  await expect(mine(page).getByRole('button', { name: 'Unsubscribe from HSK Level 2, Simplified' })).toBeFocused()

  let saves = backend.api.filter((c) => c.method === 'POST' && c.path === '/subscriptions')
  expect(saves).toHaveLength(1)
  expect(saves[0].headers.authorization).toBeTruthy()
  expect(saves[0].body).toEqual({
    subscriptions: [
      { list_id: HSK1, list_name: 'HSK Level 1', character_set: 'simplified' },
      { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'simplified' }
    ]
  })

  await mine(page).getByRole('button', { name: 'Unsubscribe from HSK Level 1, Simplified' }).click()
  await expect(page.getByRole('status')).toHaveText('Unsubscribed from HSK Level 1, Simplified.')
  await expect(mine(page).getByRole('listitem')).toHaveCount(1)
  saves = backend.api.filter((c) => c.method === 'POST' && c.path === '/subscriptions')
  expect(saves[1].body).toEqual({ subscriptions: [{ list_id: HSK2, list_name: 'HSK Level 2', character_set: 'simplified' }] })

  expect(problems).toEqual([])
})

test('dropping the last list leaves an empty account, which says so', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { user: USER })
  await page.goto('/manage-lists')
  await mine(page).getByRole('button', { name: /Unsubscribe from HSK Level 1/ }).click()
  await expect(mine(page)).toContainText('You are not subscribed to any lists.')
  expect(backend.api.find((c) => c.path === '/subscriptions').body).toEqual({ subscriptions: [] })
  await expect(more(page).getByRole('listitem')).toHaveCount(12)
})

test('reading traditional, the traditional lists come first', async ({ page }) => {
  await signedIn(page)
  await mockBackend(page, { user: { ...USER, character_set_preference: 'traditional' } })
  await page.goto('/manage-lists')
  await expect(more(page).getByRole('listitem').first()).toContainText('Traditional')
})

test('a failed save says so and changes nothing', async ({ page }) => {
  await signedIn(page)
  await mockBackend(page, { user: USER, subscriptionsFail: true })
  await page.goto('/manage-lists')

  const button = more(page).getByRole('button', { name: 'Subscribe to HSK Level 3, Simplified' })
  await button.click()
  await expect(page.getByRole('alert')).toHaveText('We could not save that change. Please try again.')
  await expect(mine(page).getByRole('listitem')).toHaveCount(1)
  await expect(button).toBeEnabled()
  await expect(page.getByText('Subscribed to HSK Level 3')).toHaveCount(0)
})

test('a failed load offers another go', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { userFails: true })
  await page.goto('/manage-lists')

  await expect(page.getByRole('alert')).toContainText('We could not load your lists.')
  backend.userFails = false
  backend.user = USER
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(mine(page).getByRole('listitem')).toHaveCount(1)
})

test('signed out, the visitor is sent to sign in, and nothing is asked of the API', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/manage-lists')
  await expect(page.getByText('Sign in to choose which lists you get.')).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/signin/)
  expect(backend.api.some((c) => c.path === '/user' || c.path === '/subscriptions')).toBe(false)
})

test('in Chinese', async ({ page }) => {
  await signedIn(page)
  // The account's own language wins over the link's once it loads.
  await mockBackend(page, { user: { ...USER, language_preference: 'cn' } })
  await page.goto('/manage-lists?lang=cn')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('我的词表')
  await expect(page.getByRole('region', { name: '已订阅' })).toContainText('简体')
  await expect(page.getByRole('button', { name: '订阅 HSK 1级（繁体）' })).toBeVisible()
})
