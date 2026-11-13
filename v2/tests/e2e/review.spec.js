import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { mockBackend, watchForErrors, HSK1, HSK2 } from './support/backend'

// Reviewing the words a level has been sent: the screen the daily email links
// to, so its URL parameters are as much a part of it as what it shows.

test('shows a level\'s recent words, newest first', async ({ page }) => {
  const backend = await mockBackend(page)
  const problems = watchForErrors(page)
  await page.goto('/review')

  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(3)
  await expect(cards.nth(0)).toContainText('爱护')
  await expect(cards.nth(2)).toContainText('朋友')
  await expect(cards.nth(0)).toContainText('ài hù')
  await expect(cards.nth(0)).toContainText('12 Nov')
  await expect(cards.nth(0)).toContainText('Level 1')

  const call = backend.api.find((c) => c.path === '/review')
  expect(call.query).toEqual({ list_id: HSK1, date_range: '30' })
  // Public endpoint: a signed-out visitor must not be sent to sign in for it.
  expect(call.headers.authorization).toBeUndefined()
  expect(problems).toEqual([])
})

test('choosing another list or range fetches it and keeps the link shareable', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/review')
  await expect(page.getByRole('article')).toHaveCount(3)

  await page.getByLabel('Vocab list').selectOption({ label: 'HSK Level 2' })
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('article')).toContainText('帮助')
  await expect(page).toHaveURL(new RegExp(`list_id=${HSK2}`))

  await page.getByLabel('Sent in').selectOption('90')
  await expect(page).toHaveURL(/date_range=90/)
  await expect.poll(() => backend.api.filter((c) => c.path === '/review').at(-1).query)
    .toEqual({ list_id: HSK2, date_range: '90' })
})

test('a link from the daily email opens the right level, range and characters', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto(`/review?list_id=${HSK2}&date_range=60&char=traditional`)

  await expect(page.getByRole('article')).toContainText('幫助')
  await expect(page.getByLabel('Vocab list')).toHaveValue(HSK2)
  await expect(page.getByLabel('Sent in')).toHaveValue('60')
  expect(backend.api.filter((c) => c.path === '/review')).toHaveLength(1)
})

test('a link with nonsense in it falls back to the defaults', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/review?list_id=not-a-list&date_range=9999')

  await expect(page.getByRole('article')).toHaveCount(3)
  expect(backend.api.find((c) => c.path === '/review').query).toEqual({ list_id: HSK1, date_range: '30' })
})

test('the old /history address still lands here, parameters intact', async ({ page }) => {
  await mockBackend(page)
  await page.goto(`/history?list_id=${HSK2}`)
  await expect(page).toHaveURL(/\/review\?/)
  await expect(page.getByRole('article')).toContainText('帮助')
})

test('each word links to example sentences', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/review')
  const link = page.getByRole('article').first().getByRole('link', { name: 'Example sentences' })
  await expect(link).toHaveAttribute('href', /yellowbridge\.com.*word=%E7%88%B1%E6%8A%A4/)
})

test('export downloads the words on screen as a file Excel can read', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/review')
  await expect(page.getByRole('article')).toHaveCount(3)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click()
  ])
  expect(download.suggestedFilename()).toBe('Chinese vocab words, past 30 days.csv')

  const bytes = await readFile(await download.path())
  // UTF-8 byte-order mark: without it Excel garbles every Chinese character.
  expect([...bytes.subarray(0, 3)]).toEqual([0xEF, 0xBB, 0xBF])
  const lines = bytes.subarray(3).toString('utf8').trim().split('\r\n')
  expect(lines[0]).toBe('date_sent,simplified,traditional,pinyin,definition,difficulty_level,hsk_level')
  expect(lines).toHaveLength(4)
  expect(lines[1]).toBe('2026-11-12,爱护,愛護,ài hù,"to cherish, ""to treasure""",Beginner,1')
})

test('says so when a level has no words in the range, and disables export', async ({ page }) => {
  await mockBackend(page, { reviewEmpty: true })
  await page.goto('/review')
  await expect(page.getByText('No words were sent for this list in that time.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export' })).toBeDisabled()
})

test('a failed load offers a retry that works once the API is back', async ({ page }) => {
  const backend = await mockBackend(page, { reviewFails: true })
  await page.goto('/review')
  await expect(page.getByRole('alert')).toContainText('could not load the words')

  backend.reviewFails = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('article')).toHaveCount(3)
})

test('reads in Chinese', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/review?lang=cn')
  await expect(page.getByRole('heading', { name: '复习每日一词' })).toBeVisible()
  await expect(page.getByRole('article').first()).toContainText('1 级')
  await expect(page.getByRole('article').first()).toContainText('11月12日')
})
