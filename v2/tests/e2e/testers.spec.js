import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, USER } from './support/backend'

// Joining the early testers (vocab POST /testers).

test('signed out: the page explains and asks to sign in', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/testers')
  await expect(page.getByRole('heading', { name: 'Help shape Haohaotiantian' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in to join' })).toHaveAttribute('href', /next=%2Ftesters|next=\/testers/)
})

test('signed in: one click joins, with the optional answer, and shows the badge', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { user: { ...USER, founding_tester: false } })
  await page.goto('/testers')
  await page.getByLabel('What would make you practice every day? (optional)').fill('Short quizzes')
  await page.getByRole('button', { name: 'Join the early testers' }).click()
  await expect(page.getByRole('heading', { name: "You're an early tester" })).toBeVisible()
  await expect(page.getByText('Early Tester', { exact: true })).toBeVisible()
  expect(backend.api.find((c) => c.method === 'POST' && c.path === '/testers').body).toEqual({ answer: 'Short quizzes' })
})

test('already a tester: straight to the thank-you', async ({ page }) => {
  await signedIn(page)
  await mockBackend(page, { user: { ...USER, founding_tester: true } })
  await page.goto('/testers')
  await expect(page.getByRole('heading', { name: "You're an early tester" })).toBeVisible()
})

test('a failed join says so', async ({ page }) => {
  await signedIn(page)
  await mockBackend(page, { user: { ...USER, founding_tester: false }, testersFails: true })
  await page.goto('/testers')
  await page.getByRole('button', { name: 'Join the early testers' }).click()
  await expect(page.getByRole('alert')).toContainText("Couldn't join")
})
