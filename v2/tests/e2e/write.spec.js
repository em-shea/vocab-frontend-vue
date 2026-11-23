import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { mockBackend, signedIn, userActivity, HSK1 } from './support/backend.js'

// Handwriting practice: each character of today's words is written stroke by
// stroke in Hanzi Writer. The stroke data is served from the installed
// hanzi-writer-data package (see support/backend.js).

const strokesOf = (char) => JSON.parse(readFileSync(
  fileURLToPath(new URL(`../../node_modules/hanzi-writer-data/${char}.json`, import.meta.url)), 'utf8'))

// Draw a character by tracing each stroke's centre line. Hanzi Writer's data
// is in a 1024 box with y pointing up from a baseline of 900.
async function write (page, char) {
  const box = await page.getByRole('img', { name: `Writing box for ${char}` }).boundingBox()
  const padding = Math.round(box.width * 0.06)
  const scale = (box.width - 2 * padding) / 1024
  const at = ([x, y]) => [box.x + padding + x * scale, box.y + padding + (900 - y) * scale]
  for (const median of strokesOf(char).medians) {
    const [first, ...rest] = median.map(at)
    await page.mouse.move(...first)
    await page.mouse.down()
    for (const point of rest) await page.mouse.move(...point, { steps: 4 })
    await page.mouse.up()
    await page.waitForTimeout(120)
  }
}

test('writing every character of a word saves it and marks it done', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { userActivity: userActivity() })
  await page.goto('/write')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stroke order')
  await expect(page.getByRole('heading', { name: /爱护/ })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Writing box for 爱' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Writing box for 护' })).toBeVisible()
  await expect.poll(() => backend.strokes.sort()).toEqual(['护', '爱'].sort())

  await write(page, '爱')
  await expect(page.getByText('爱 written.')).toBeAttached()
  expect(backend.api.filter((c) => c.path === '/writing')).toHaveLength(0) // not until the word is done

  await write(page, '护')
  await expect(page.locator('.word__status')).toContainText('Done')
  const call = backend.api.find((c) => c.method === 'POST' && c.path === '/writing')
  expect(call.body).toMatchObject({ list_id: HSK1, characters: '爱护', character_set: 'simplified' })
  expect(call.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})

test('a word already practised shows as done', async ({ page }) => {
  await signedIn(page)
  const ua = userActivity()
  const activity = ua.activity
  const today = Object.keys(activity).sort().at(-1)
  activity[today].review_words[0].written = true
  await mockBackend(page, { userActivity: ua })
  await page.goto('/write')
  await expect(page.locator('.word__status')).toContainText('Done')
})

test('stroke data that will not load says so', async ({ page }) => {
  await signedIn(page)
  await mockBackend(page, { userActivity: userActivity(), strokesFail: true })
  await page.goto('/write')
  await expect(page.getByText("Couldn't load the strokes for 爱.", { exact: false })).toBeVisible()
})

test('signed out, it asks to sign in', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/write')
  await expect(page.getByText("Sign in to practise the stroke order of today's words.")).toBeVisible()
})
