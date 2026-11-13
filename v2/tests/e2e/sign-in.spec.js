import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, watchForErrors, EMAIL } from './support/backend'

// Signing in, start to finish, as a subscriber experiences it: ask for a link,
// get told to check email, open the link, arrive signed in.

test('a subscriber signs in with the emailed link', async ({ page }) => {
  const backend = await mockBackend(page)
  const problems = watchForErrors(page)

  await page.goto('/')
  await page.getByRole('link', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/signin/)

  await page.getByLabel('Email address').fill(EMAIL)
  await page.getByRole('button', { name: 'Send sign-in link' }).click()

  await expect(page).toHaveURL(/\/verification/)
  await expect(page.getByRole('heading', { name: 'Sign-in link sent' })).toBeVisible()
  await expect(page.getByText(EMAIL)).toBeVisible()
  expect(backend.cognito).toEqual(['InitiateAuth'])

  // The email link is a fresh page load, as it is from a mail client.
  await page.goto('/verification?code=good-code')

  await expect(page).toHaveURL((url) => url.pathname === '/')
  await expect(page.getByRole('link', { name: EMAIL })).toBeVisible()

  // The API authorizer wants the raw token. "Bearer …" is rejected with a 401,
  // which would sign everyone out of everything, so pin it here.
  const userCall = backend.api.find((c) => c.path === '/user')
  expect(userCall.headers.authorization).toMatch(/^eyJ/)
  expect(backend.api.some((c) => c.method === 'POST' && c.path === '/update_login')).toBe(true)
  expect(problems).toEqual([])
})

test('the sign-in survives a reload', async ({ page }) => {
  await mockBackend(page)
  await signedIn(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: EMAIL })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: EMAIL })).toBeVisible()
})

test('an address that is not an email is caught before anything is sent', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/signin')
  await page.getByLabel('Email address').fill('not-an-email')
  await page.getByRole('button', { name: 'Send sign-in link' }).click()

  await expect(page.getByRole('alert')).toHaveText('Please enter a valid email address.')
  await expect(page).toHaveURL(/\/signin/)
  expect(backend.cognito).toEqual([])
})

test('an address with no account is told to subscribe first', async ({ page }) => {
  await mockBackend(page, { knownUser: false })
  await page.goto('/signin')
  await page.getByLabel('Email address').fill('stranger@example.com')
  await page.getByRole('button', { name: 'Send sign-in link' }).click()

  await expect(page.getByRole('alert')).toContainText('could not find an account')
  await expect(page).toHaveURL(/\/signin/)
})

test('links from emails arrive with the address filled in', async ({ page }) => {
  await mockBackend(page)
  await page.goto(`/signin?email=${encodeURIComponent(EMAIL)}`)
  await expect(page.getByLabel('Email address')).toHaveValue(EMAIL)
})

test('an expired or wrong link says so and offers a new one', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/signin')
  await page.getByLabel('Email address').fill(EMAIL)
  await page.getByRole('button', { name: 'Send sign-in link' }).click()
  await expect(page).toHaveURL(/\/verification/)

  await page.goto('/verification?code=stale-code')
  await expect(page.getByText('That link is incorrect or has expired.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible() // still signed out

  await page.getByRole('button', { name: 'Resend sign-in link' }).click()
  await expect(page.getByText('Link resent. Please check your email.')).toBeVisible()
  expect(backend.cognito).toEqual(['InitiateAuth', 'RespondToAuthChallenge', 'InitiateAuth'])
})

test('a link opened in a different browser explains why it cannot work', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/verification?code=good-code')

  await expect(page.getByRole('heading', { name: 'Open the link where you asked for it' })).toBeVisible()
  expect(backend.cognito).toEqual([])
  await page.getByRole('link', { name: 'Start again' }).click()
  await expect(page).toHaveURL(/\/signin/)
})

test('the check-your-email page sends a visitor with nothing pending to sign in', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/verification')
  await expect(page).toHaveURL(/\/signin/)
})

test('signing in works in Chinese', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/signin?lang=cn')
  await page.getByLabel('电子邮箱').fill(EMAIL)
  await page.getByRole('button', { name: '发送登录链接' }).click()
  await expect(page.getByRole('heading', { name: '登录链接已发送' })).toBeVisible()
  await expect(page).toHaveURL(/lang=cn/)
})
