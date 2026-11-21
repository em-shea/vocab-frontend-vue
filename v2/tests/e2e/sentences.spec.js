import { test, expect } from '@playwright/test'
import { mockBackend as mockAll, signedIn, watchForErrors, sentencesSwitchedOn, HSK1, USER, ACTIVITY, audioFor } from './support/backend'

// These tests use the fixed ACTIVITY days unless they give their own.
const mockBackend = (page, options = {}) => mockAll(page, { activity: ACTIVITY, ...options })

// Practice sentences. Held back by SENTENCES_ENABLED: switched off (the
// default) the path still resolves but leads elsewhere, as on the old site;
// switched on (sentencesSwitchedOn) the screen itself.

// A signed-in person's saved reading settings win over the link's, so to see
// the screen another way the account has to prefer it.
async function accountPrefers (page, settings) {
  await page.route(/\/user$/, (route) => route.request().method() === 'GET'
    ? route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ ...USER, ...settings })
    })
    : route.fallback())
}

test.describe('switched off', () => {
  test('/sentences leads on rather than 404ing, keeping the language', async ({ page }) => {
    const backend = await mockBackend(page)
    await page.goto('/sentences?lang=cn')
    // To the profile, which sends a signed-out visitor on to sign in.
    await expect(page).toHaveURL(/\/(profile|signin)\?lang=cn$/)
    await expect(page.getByRole('heading', { name: '练习造句' })).toHaveCount(0)
    expect(backend.api.some((c) => c.path === '/sentences')).toBe(false)
  })
})

test.describe('switched on', () => {
  test.beforeEach(async ({ page }) => { await sentencesSwitchedOn(page) })

  test('shows today\'s words and the sentences written so far', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page)
    const problems = watchForErrors(page)
    await page.goto('/sentences')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Practice sentences')
    const today = page.getByRole('region', { name: "Today's words" })
    await expect(today.getByRole('article')).toHaveCount(2)
    await expect(today.getByLabel('A sentence with 朋友')).toHaveValue('')
    // Written earlier today: there to edit.
    await expect(today.getByLabel('A sentence with 爱护')).toHaveValue('请爱护你的书。')
    // Ideas for a sentence, from the same site as the daily email (HSK 1 → YellowBridge).
    const examples = today.getByRole('link', { name: /Example sentences/ }).first()
    await expect(examples).toHaveAttribute('href', /^https:\/\/www\.yellowbridge\.com\/chinese\/sentsearch\.php\?word=/)
    await expect(examples).toHaveAttribute('target', '_blank')
    // The label is for screen readers only; the word above the field says it on screen.
    const label = await today.locator('label', { hasText: 'A sentence with 朋友' }).boundingBox()
    expect(label.width * label.height).toBeLessThanOrEqual(1)
    // Yesterday's word is not offered: a sentence is always filed under today.
    await expect(today.getByText('学习')).toHaveCount(0)

    const written = page.getByRole('region', { name: 'Your sentences' }).getByRole('listitem')
    await expect(written).toHaveCount(3)
    await expect(written.nth(0)).toContainText('请爱护你的书。')
    await expect(written.nth(0)).toContainText('20 Nov 2026')
    await expect(written.nth(1)).toContainText('我每天学习汉语。')
    await expect(written.nth(1)).toContainText('学习')
    await expect(written.nth(2)).toContainText('中文很好听。')
    await expect(written.nth(2)).toContainText('2 Mar 2025')

    const authed = backend.api.filter((c) => ['/user_activity', '/sentences'].includes(c.path))
    expect(authed.map((c) => c.path).sort()).toEqual(['/sentences', '/user_activity'])
    for (const call of authed) expect(call.headers.authorization).toBeTruthy()
    expect(problems).toEqual([])
  })

  test('writing a new sentence saves it in the shape the API stores, and a resave replaces it', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page)
    await page.goto('/sentences')

    const field = page.getByLabel('A sentence with 朋友')
    await field.fill('  他是我的好朋友。 ')
    await field.press('Enter')
    await expect(page.getByRole('status').filter({ hasText: 'Saved.' })).toBeVisible()

    const saves = () => backend.api.filter((c) => c.method === 'POST' && c.path === '/sentences')
    expect(saves()).toHaveLength(1)
    const first = saves()[0]
    expect(first.headers.authorization).toBeTruthy()
    expect(first.body).toEqual({
      sentence_id: expect.stringMatching(/\S/),
      sentence: '他是我的好朋友。',
      list_id: HSK1,
      character_set: 'simplified',
      word: {
        'Word id': 'w-friend',
        Simplified: '朋友',
        Traditional: '朋友',
        Pinyin: 'péng you',
        Definition: 'friend',
        'Audio file key': audioFor('朋友'),
        'Difficulty level': 'Beginner',
        'HSK Level': '1'
      }
    })

    // Listed with the others, newest first, with its word.
    const written = page.getByRole('region', { name: 'Your sentences' }).getByRole('listitem')
    await expect(written).toHaveCount(4)
    await expect(written.filter({ hasText: '他是我的好朋友。' })).toContainText('péng you')

    // Editing clears the message, and saving again keeps the same id.
    await field.fill('朋友们好。')
    await expect(page.getByRole('status').filter({ hasText: 'Saved.' })).toHaveCount(0)
    await page.getByRole('article').filter({ has: field }).getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Saved.' })).toBeVisible()
    expect(saves()).toHaveLength(2)
    expect(saves()[1].body.sentence_id).toBe(first.body.sentence_id)
    await expect(written).toHaveCount(4)
    await expect(written.filter({ hasText: '朋友们好。' })).toHaveCount(1)
  })

  test('editing today\'s existing sentence keeps its id', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page)
    await accountPrefers(page, { character_set_preference: 'traditional' })
    await page.goto('/sentences')

    const field = page.getByLabel('A sentence with 愛護')
    await field.fill('請愛護環境。')
    await field.press('Enter')
    await expect(page.getByRole('status').filter({ hasText: 'Saved.' })).toBeVisible()
    const call = backend.api.find((c) => c.method === 'POST' && c.path === '/sentences')
    expect(call.body).toMatchObject({ sentence_id: 's-today', sentence: '請愛護環境。', character_set: 'traditional' })
    await expect(page.getByRole('region', { name: 'Your sentences' }).getByRole('listitem')).toHaveCount(3)
  })

  test('an empty sentence is not sent', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page)
    await page.goto('/sentences')

    const field = page.getByLabel('A sentence with 朋友')
    await field.fill('   ')
    await page.getByRole('article').filter({ has: field }).getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Write a sentence first.')).toBeVisible()
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toBeFocused()
    expect(backend.api.some((c) => c.method === 'POST')).toBe(false)
  })

  test('a failed save says so, keeps the sentence, and can be tried again', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { saveSentenceFails: true })
    await page.goto('/sentences')

    const field = page.getByLabel('A sentence with 朋友')
    await field.fill('他是我的好朋友。')
    await field.press('Enter')
    await expect(page.getByText('We could not save your sentence. Try again.')).toBeVisible()
    await expect(field).toHaveValue('他是我的好朋友。')
    await expect(page.getByRole('region', { name: 'Your sentences' }).getByRole('listitem')).toHaveCount(3)

    backend.saveSentenceFails = false
    await field.press('Enter')
    await expect(page.getByRole('status').filter({ hasText: 'Saved.' })).toBeVisible()
    const saves = backend.api.filter((c) => c.method === 'POST' && c.path === '/sentences')
    // The retry is the same sentence, not a second one.
    expect(saves[1].body.sentence_id).toBe(saves[0].body.sentence_id)
  })

  test('a failed load says so and can be retried', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { sentencesFails: true })
    await page.goto('/sentences')

    await expect(page.getByRole('alert')).toContainText('We could not load your words and sentences.')
    backend.sentencesFails = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('region', { name: 'Your sentences' }).getByRole('listitem')).toHaveCount(3)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  })

  test('a failed activity load is an error too', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { activityFails: true })
    await page.goto('/sentences')
    await expect(page.getByRole('alert')).toContainText('We could not load your words and sentences.')
  })

  test('nothing sent today and nothing written yet', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { activity: { '2026-11-20': { review_words: [] } }, sentences: [] })
    await page.goto('/sentences')
    await expect(page.getByText('No new words for you today.')).toBeVisible()
    await expect(page.getByText('You have not written any sentences yet.')).toBeVisible()
  })

  test('a long history shows ten at a time', async ({ page }) => {
    await signedIn(page)
    const many = Array.from({ length: 23 }, (_, i) => ({
      sentence_id: `s${String(i).padStart(2, '0')}`,
      sentence: `第${i + 1}句。`,
      character_set: 'simplified',
      date_created: `2026-10-${String(i + 1).padStart(2, '0')}`
    }))
    await mockBackend(page, { sentences: many })
    await page.goto('/sentences')

    const written = page.getByRole('region', { name: 'Your sentences' }).getByRole('listitem')
    await expect(written).toHaveCount(10)
    await expect(written.first()).toContainText('第23句。')
    await page.getByRole('button', { name: 'Show more' }).click()
    await expect(written).toHaveCount(20)
    await expect(written.nth(10)).toBeFocused()
    await page.getByRole('button', { name: 'Show more' }).click()
    await expect(written).toHaveCount(23)
    await expect(page.getByRole('button', { name: 'Show more' })).toHaveCount(0)
  })

  test('signed out: asked to sign in, and nothing is requested', async ({ page }) => {
    const backend = await mockBackend(page)
    await page.goto('/sentences')
    await expect(page.getByText('Sign in to write sentences with your daily words.')).toBeVisible()
    await page.getByRole('main').getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/signin/)
    expect(backend.api.some((c) => ['/sentences', '/user_activity'].includes(c.path))).toBe(false)
  })

  test('in Chinese', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page)
    await accountPrefers(page, { language_preference: 'cn' })
    await page.goto('/sentences')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('练习造句')
    await expect(page.getByLabel('用“朋友”造句')).toBeVisible()
    await expect(page.getByRole('region', { name: '我的句子' }).getByRole('listitem').first()).toContainText('2026年11月20日')
  })
})
