import { test, expect } from '@playwright/test'
import { mockBackend, signedIn } from './support/backend'

// Daily word notifications in profile settings. The dev server runs without a
// service worker, so the browser's push pieces are stood in for here.
async function fakePush (page, { permission = 'default', answer = 'granted', subscribed = false } = {}) {
  await page.addInitScript(({ permission, answer, subscribed }) => {
    let sub = subscribed ? { endpoint: 'https://push.example.com/me' } : null
    const make = () => ({
      endpoint: 'https://push.example.com/me',
      toJSON: () => ({ endpoint: 'https://push.example.com/me', keys: { p256dh: 'k', auth: 'a' } }),
      unsubscribe: async () => { sub = null; return true }
    })
    if (sub) sub = make()
    const pushManager = {
      getSubscription: async () => sub,
      subscribe: async () => { sub = make(); return sub }
    }
    Object.defineProperty(navigator, 'serviceWorker', { value: { ready: Promise.resolve({ pushManager }) } })
    window.PushManager = window.PushManager || function () {}
    window.Notification = { permission, requestPermission: async () => { window.Notification.permission = answer; return answer } }
  }, { permission, answer, subscribed })
}

async function pushCalls (page) {
  const calls = []
  await page.route('**/push', async (route) => {
    calls.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
  })
  return calls
}

test.beforeEach(async ({ page }) => {
  await mockBackend(page)
  await signedIn(page)
})

test('turning notifications on and off saves this device', async ({ page }) => {
  await fakePush(page)
  const calls = await pushCalls(page)
  await page.goto('/profile-settings')

  const toggle = page.getByRole('switch', { name: "Today's word on this device" })
  await expect(toggle).not.toBeChecked()
  await toggle.click()
  await expect(toggle).toBeChecked()
  await expect.poll(() => calls.length).toBe(1)
  expect(calls[0]).toMatchObject({ action: 'subscribe', subscription: { endpoint: 'https://push.example.com/me' } })

  await toggle.click()
  await expect(toggle).not.toBeChecked()
  await expect.poll(() => calls.length).toBe(2)
  expect(calls[1]).toEqual({ action: 'unsubscribe', subscription: { endpoint: 'https://push.example.com/me' } })
})

test('a device already subscribed shows the toggle on', async ({ page }) => {
  await fakePush(page, { permission: 'granted', subscribed: true })
  await page.goto('/profile-settings')
  await expect(page.getByRole('switch', { name: "Today's word on this device" })).toBeChecked()
})

test('saying no to the browser leaves it off and explains how to allow', async ({ page }) => {
  await fakePush(page, { answer: 'denied' })
  const calls = await pushCalls(page)
  await page.goto('/profile-settings')
  await page.getByRole('switch').click()
  await expect(page.getByText('Notifications are blocked for this site.')).toBeVisible()
  expect(calls).toHaveLength(0)
})

test('a failed save says so and leaves the toggle off', async ({ page }) => {
  await fakePush(page)
  await page.route('**/push', (route) => route.fulfill({ status: 502, body: '{}' }))
  await page.goto('/profile-settings')
  const toggle = page.getByRole('switch')
  await toggle.click()
  await expect(page.getByRole('alert')).toHaveText("Couldn't change notifications. Please try again.")
  await expect(toggle).not.toBeChecked()
})
