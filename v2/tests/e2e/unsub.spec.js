import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, watchForErrors, HSK1, HSK2 } from './support/backend'

// Unsubscribing without signing in. Every daily email's footer links here as
// /unsub?list=<list_id>&char=<set>&email=<address> (vocab:
// send_daily_email/app.py builds it), so those parameters must keep working.

const unsubCalls = (backend) => backend.api.filter((c) => c.method === 'POST' && c.path === '/unsub')

test('from the email link: the form is filled in, and one list is left', async ({ page }) => {
  const backend = await mockBackend(page)
  const problems = watchForErrors(page)
  await page.goto(`/unsub?list=${HSK2}&char=traditional&email=me%2Btag%40example.com`)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Unsubscribe')
  await expect(page.getByLabel('Email address')).toHaveValue('me+tag@example.com')
  await expect(page.getByLabel('List', { exact: true })).toHaveValue(`${HSK2}#TRADITIONAL`)
  await expect(page.getByLabel('List', { exact: true }).locator('option:checked')).toHaveText('HSK Level 2 · Traditional')
  // The address does not stay in the address bar or the history.
  await expect(page).not.toHaveURL(/email=|list=|char=/)

  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('status')).toContainText('You are unsubscribed.')
  // The link's character set is the reader's, so the farewell is in it too.
  await expect(page.getByRole('status')).toContainText('希望我們後會有期！')

  const calls = unsubCalls(backend)
  expect(calls).toHaveLength(1)
  expect(calls[0].headers.authorization, 'a public endpoint gets no token').toBeFalsy()
  expect(calls[0].body).toEqual({
    cognito_id: '',
    email: 'me+tag@example.com',
    list: { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'traditional' }
  })
  expect(problems).toEqual([])
})

test('unsubscribe from everything sends no list', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto(`/unsub?list=${HSK1}&char=simplified&email=me%40example.com`)

  await page.getByLabel('Unsubscribe from all lists').check()
  await expect(page.getByLabel('List', { exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('status')).toContainText('希望我们后会有期！')
  expect(unsubCalls(backend)[0].body).toEqual({ cognito_id: '', email: 'me@example.com', list: '' })
})

test('a list from the link that is not an HSK list is kept, not turned into "all"', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/unsub?list=my-own-list&char=simplified&email=me%40example.com')

  await expect(page.getByLabel('List', { exact: true }).locator('option:checked')).toHaveText('The list in your email · Simplified')
  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('status')).toContainText('You are unsubscribed.')
  expect(unsubCalls(backend)[0].body.list).toEqual({ list_id: 'my-own-list', list_name: 'Vocab list', character_set: 'simplified' })
})

test('typed in by hand, with no link', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/unsub')

  await expect(page.getByLabel('List', { exact: true })).toHaveValue(`${HSK1}#SIMPLIFIED`)
  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('alert')).toHaveText('Enter a valid email address.')
  await expect(page.getByLabel('Email address')).toBeFocused()
  await expect(page.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true')
  expect(unsubCalls(backend)).toHaveLength(0)

  await page.getByLabel('Email address').fill('me@example.com')
  await page.getByLabel('List', { exact: true }).selectOption(`${HSK2}#TRADITIONAL`)
  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('status')).toContainText('You are unsubscribed.')
  expect(unsubCalls(backend)[0].body.list).toMatchObject({ list_id: HSK2, character_set: 'traditional' })
})

test('when the backend fails it says so and the form can be sent again', async ({ page }) => {
  const backend = await mockBackend(page, { unsubFails: true })
  await page.goto(`/unsub?list=${HSK1}&char=simplified&email=me%40example.com`)

  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('alert')).toContainText('Something went wrong.')
  await expect(page.getByRole('alert')).toContainText('contact@haohaotiantian.com')
  await expect(page.getByRole('status')).toHaveText('')

  backend.unsubFails = false
  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('status')).toContainText('You are unsubscribed.')
  await expect(page.getByRole('alert')).toHaveText('')
})

test('signed out, the way to change lists goes through sign-in; signed in, straight there', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/unsub')
  await expect(page.getByRole('link', { name: 'Change which lists you get' })).toHaveAttribute('href', /\/signin/)

  await signedIn(page)
  await page.goto('/unsub')
  await expect(page.getByRole('link', { name: 'Change which lists you get' })).toHaveAttribute('href', /\/manage-lists/)
})

test('in Chinese', async ({ page }) => {
  await mockBackend(page)
  await page.goto(`/unsub?list=${HSK1}&char=simplified&email=me%40example.com&lang=cn`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('退订')
  await expect(page.getByLabel('词表', { exact: true }).locator('option:checked')).toHaveText('HSK 1级 · 简体')
  await page.getByRole('button', { name: '退订', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已退订。')
  // The language survives the link's own parameters being tidied away.
  await expect(page).toHaveURL(/lang=cn/)
})
