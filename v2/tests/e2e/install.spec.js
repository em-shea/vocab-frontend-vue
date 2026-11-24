import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, userActivity, profileQuiz, daysAgo } from './support/backend'

// The install prompt on the profile, after a first finished task.
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

async function asIphone (page) {
  await page.addInitScript((ua) => Object.defineProperty(navigator, 'userAgent', { value: ua }), IPHONE)
}

// Chrome's install event, fired as the page loads, with the person's answer.
async function chromeOffersInstall (page, answer = 'accepted') {
  await page.addInitScript((answer) => {
    window.__prompted = 0
    window.addEventListener('DOMContentLoaded', () => {
      const event = new Event('beforeinstallprompt', { cancelable: true })
      event.prompt = () => { window.__prompted++ }
      event.userChoice = Promise.resolve({ outcome: answer })
      setTimeout(() => window.dispatchEvent(event), 0)
    })
  }, answer)
}

const withQuiz = (page) => mockBackend(page, { userActivity: userActivity(), quizzes: [profileQuiz('q1', daysAgo(0), 8, 10)] })

test.beforeEach(async ({ page }) => { await signedIn(page) })

test('not asked before anything is finished', async ({ page }) => {
  await asIphone(page)
  await mockBackend(page, { userActivity: userActivity(), quizzes: [] })
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: /Today's words?/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Install the app' })).toHaveCount(0)
})

test('iPhone gets the Add to Home Screen steps, and Not now keeps it away', async ({ page }) => {
  await asIphone(page)
  await withQuiz(page)
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Install the app' })).toBeVisible()
  await expect(page.getByText('Tap Share, then Add to Home Screen.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Install' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Not now' }).click()
  await expect(page.getByRole('heading', { name: 'Install the app' })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: /Today's words?/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Install the app' })).toHaveCount(0)
})

test('Chrome uses its own install prompt', async ({ page }) => {
  await chromeOffersInstall(page)
  await withQuiz(page)
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Install', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Install the app' })).toHaveCount(0)
  expect(await page.evaluate(() => window.__prompted)).toBe(1)
})

test('not asked where the browser can\'t install', async ({ page }) => {
  await withQuiz(page)
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: /Today's words?/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Install the app' })).toHaveCount(0)
})
