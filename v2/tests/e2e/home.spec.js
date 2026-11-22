import { test, expect } from '@playwright/test'
import { mockBackend, HSK1 } from './support/backend'

// The home page shipped in Phase 3 without tests. These pin what it already
// does, so later phases cannot quietly break subscribing.

test('shows real sample words for each level', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')
  await expect(page.getByText('爱护').first()).toBeVisible()
  await expect(page.getByText('to cherish').first()).toBeVisible()
})

test('a new visitor subscribes to a level', async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto('/')

  const form = page.locator('form').first()
  await expect(form.getByRole('combobox')).toHaveValue(HSK1)
  await form.getByRole('textbox').fill('new@example.com')
  await form.getByRole('button').click()

  // Then emails a sign-in link and moves on to /subscribed (see subscribed.spec.js).
  await expect(page).toHaveURL(/\/subscribed/)
  expect(backend.cognito).toEqual(['SignUp', 'InitiateAuth'])
  const call = backend.api.find((c) => c.path === '/set_subs')
  expect(call.body).toMatchObject({
    cognito_id: 'sub-new',
    email: 'new@example.com',
    subscriptions: [{ list_id: HSK1, list_name: 'HSK Level 1' }]
  })
})

test('an address that is already subscribed is pointed at sign-in, not told it worked', async ({ page }) => {
  const backend = await mockBackend(page, { existingUser: true })
  await page.goto('/')

  const form = page.locator('form').first()
  await form.getByRole('textbox').fill('old@example.com')
  await form.getByRole('button').click()

  await expect(form.getByRole('status')).toContainText('already subscribed')
  expect(backend.api.some((c) => c.path === '/set_subs')).toBe(false)
})

test('switching to traditional characters changes the study content', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?char=traditional')
  await expect(page.getByText('愛護').first()).toBeVisible()
})

// The home page has two versions from one codebase: the launch page (the
// default, while HEROES_LAUNCHED is false) and the heroes page. `?home=` picks
// one whatever the flag says, so both are tested here.
const VERSIONS = [
  { name: 'launch', path: '/?home=launch' },
  { name: 'heroes', path: '/?home=heroes' }
]

for (const version of VERSIONS) {
  test(`${version.name}: the subscribe form is visible without scrolling on a phone`, async ({ page }) => {
    await mockBackend(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(version.path)

    const form = page.locator('form').first()
    await expect(form.getByRole('button', { name: /subscribe/i })).toBeInViewport({ ratio: 1 })
    await expect(form.getByRole('textbox')).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })

  test(`${version.name}: the prints have no captions, and the footer credits them once`, async ({ page }) => {
    await mockBackend(page)
    await page.goto(version.path)

    expect(await page.locator('img.print__img').count()).toBeGreaterThanOrEqual(2)
    await expect(page.locator('figure:has(img) figcaption')).toHaveCount(0)

    const footer = page.locator('footer.site-footer')
    await expect(footer).toHaveCount(1)
    await expect(footer).toContainText('Utagawa Kuniyoshi')
    await expect(footer).toContainText('One Hundred and Eight Heroes of the Popular Water Margin')
    await expect(footer).toContainText('Public domain')
  })

  test(`${version.name}: practice has its own heading and a section for each kind`, async ({ page }) => {
    await mockBackend(page)
    await page.goto(version.path)

    await expect(page.getByRole('heading', { level: 2, name: 'Practise and track your progress' })).toBeVisible()
    await expect(page.getByText(/ways to study/i)).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 3, name: 'Take quizzes' })).toBeVisible()
    // Practice sentences replaced example sentences in both versions (2026-11-21).
    await expect(page.getByRole('heading', { level: 3, name: 'Use words in sentences' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'See example sentences' })).toHaveCount(0)
  })

  test(`${version.name}: shows an example of the daily email`, async ({ page }) => {
    await mockBackend(page)
    await page.goto(version.path)

    const mail = page.getByRole('figure', { name: 'Example of the daily email' })
    await expect(mail).toContainText("Today's word")
    await expect(mail).not.toContainText('我们要爱护环境。')
    await expect(mail).toContainText('ài hù')
    await expect(mail).toContainText('to cherish; to take care of')
  })

  test(`${version.name}: nothing uses the sprite images, and nothing leads to the upload page`, async ({ page }) => {
    await mockBackend(page)
    await page.goto(version.path)
    await page.evaluate(() => document.fonts.ready)

    const sprites = await page.evaluate(() =>
      [...document.querySelectorAll('*')].filter((el) =>
        /lu-zhishen|wu-song|sprites/.test(getComputedStyle(el).backgroundImage) ||
        /lu-zhishen|wu-song|sprites/.test(el.getAttribute('src') ?? '')).length)
    expect(sprites).toBe(0)
    await expect(page.locator('a[href*="manage-lists"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /upload/i })).toHaveCount(0)
  })
}

test('the default page is the launch version', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One Chinese vocabulary word a day')
})

test('launch: leads with the daily word, has no launching-soon notes, previews the heroes', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?home=launch')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One Chinese vocabulary word a day')
  await expect(page.getByText('Expand your Chinese vocabulary with daily words and quizzes.')).toBeVisible()
  await expect(page.getByText('Climb the mountain')).toHaveCount(0)
  await expect(page.getByText('替天行道')).toHaveCount(0)
  await expect(page.getByText('Launching soon')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Coming soon: practise daily to unlock the 108 heroes of the Water Margin' })).toBeVisible()
  // Study is only what exists: quizzes, example sentences and review. No links for now.
  await expect(page.getByRole('heading', { level: 3, name: 'Take quizzes' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Review past words' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /catalogue/i })).toHaveCount(0)
})

test('heroes: the full page, with four launching-soon notes', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?home=heroes')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Climb the mountain')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Unite the 108')
  // Catalogue, upload, writing and quests. Sentences are live.
  await expect(page.getByText('Launching soon', { exact: true })).toHaveCount(4)
  await expect(page.getByRole('heading', { name: 'Choose from a catalogue' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Upload your own list' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Collect heroes' })).toBeVisible()
  await expect(page.getByText('花和尚')).toBeVisible()
})
