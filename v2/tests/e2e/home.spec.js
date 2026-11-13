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
