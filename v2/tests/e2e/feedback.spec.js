import { test, expect } from '@playwright/test'
import { mockBackend, signedIn } from './support/backend'

// "Got feedback?" sits in the footer for signed-in learners only, so every
// message comes from someone we can reply to.

test('the footer link is hidden when signed out', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')
  const footer = page.locator('footer.site-footer')
  await expect(footer.getByRole('link', { name: 'Credits' })).toBeVisible()
  await expect(footer.getByRole('link', { name: 'Got feedback?' })).toHaveCount(0)
})

test('a signed-out visit to /feedback goes to sign in', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/feedback')
  await expect(page).toHaveURL(/\/signin/)
})

test('a signed-in learner sends feedback from the footer', async ({ page }) => {
  const backend = await mockBackend(page)
  await signedIn(page)
  await page.goto('/profile')
  await page.locator('footer.site-footer').getByRole('link', { name: 'Got feedback?' }).click()
  await expect(page).toHaveURL(/\/feedback\?from=(%2F|\/)profile$/)
  await expect(page.getByRole('heading', { name: 'Got feedback?' })).toBeVisible()

  const send = page.getByRole('button', { name: 'Send' })
  await expect(send).toBeDisabled()
  await page.getByLabel('Your feedback').fill('Stroke order is great. Could quizzes have audio?')
  await send.click()
  await expect(page.getByText("Thanks! We'll reply to you by email.")).toBeVisible()

  const call = backend.api.find((c) => c.method === 'POST' && c.path === '/feedback')
  expect(call.body).toEqual({ message: 'Stroke order is great. Could quizzes have audio?', page: '/profile' })
})

test('a failed send keeps the message and says so', async ({ page }) => {
  await mockBackend(page, { feedbackFails: true })
  await signedIn(page)
  await page.goto('/feedback')
  await page.getByLabel('Your feedback').fill('Hello')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByRole('alert')).toHaveText("That didn't send. Please try again.")
  await expect(page.getByLabel('Your feedback')).toHaveValue('Hello')
})
