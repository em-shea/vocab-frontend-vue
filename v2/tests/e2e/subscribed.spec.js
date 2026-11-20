import { test, expect } from '@playwright/test'
import { mockBackend, watchForErrors, HSK1 } from './support/backend'

// After subscribing on the home page: the old site emailed a sign-in link and
// went to /subscribed, which says to look for it. This keeps both.

test('subscribing emails a sign-in link and leads to the confirmation', async ({ page }) => {
  const backend = await mockBackend(page)
  const problems = watchForErrors(page)
  await page.goto('/')

  const form = page.locator('form').first()
  await expect(form.getByRole('combobox')).toHaveValue(HSK1)
  await form.getByRole('textbox').fill('new@example.com')
  await form.getByRole('button').click()

  await expect(page).toHaveURL(/\/subscribed/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("You're subscribed")
  await expect(page.getByText('We have emailed a sign-in link to new@example.com.')).toBeVisible()
  // Sign-up, then the sign-in link, in that order.
  expect(backend.cognito).toEqual(['SignUp', 'InitiateAuth'])
  await page.getByRole('link', { name: 'Get a new link' }).click()
  await expect(page).toHaveURL(/\/signin/)
  expect(problems).toEqual([])
})

test('if the sign-in link cannot be sent, the subscription still counts', async ({ page }) => {
  const backend = await mockBackend(page, { knownUser: false })
  await page.goto('/')
  const form = page.locator('form').first()
  await form.getByRole('textbox').fill('new@example.com')
  await form.getByRole('button').click()

  await expect(page).toHaveURL(/\/subscribed/)
  await expect(page.getByText('We have emailed you a sign-in link.')).toBeVisible()
  expect(backend.api.some((c) => c.path === '/set_subs')).toBe(true)
})

test('in Chinese, the confirmation keeps the language', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?lang=cn')
  const form = page.locator('form').first()
  await form.getByRole('textbox').fill('new@example.com')
  await form.getByRole('button').click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('订阅成功')
  await expect(page).toHaveURL(/\/subscribed\?lang=cn/)
})

test('an old link to /subscribed still opens', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/subscribed')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("You're subscribed")
  await expect(page.getByText('We have emailed you a sign-in link.')).toBeVisible()
})
