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

  await expect(form.getByRole('status')).toContainText('Check your inbox')
  expect(backend.cognito).toEqual(['SignUp'])
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

  test(`${version.name}: every woodblock print has a source credit`, async ({ page }) => {
    await mockBackend(page)
    await page.goto(version.path)

    const figures = page.locator('figure').filter({ has: page.locator('img') })
    const count = await figures.count()
    expect(count).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < count; i++) {
      const caption = figures.nth(i).locator('figcaption')
      await expect(caption).toContainText('Utagawa Kuniyoshi')
      await expect(caption).toContainText('One Hundred and Eight Heroes of the Popular Water Margin')
      await expect(caption).toContainText('Public domain')
    }
    // No print is left without a figcaption, whatever its source path.
    expect(await page.locator('img.print__img').count()).toBe(await page.locator('figure.print > figcaption').count())
  })

  test(`${version.name}: shows an example of the daily email`, async ({ page }) => {
    await mockBackend(page)
    await page.goto(version.path)

    const mail = page.getByRole('figure', { name: 'Example of the daily email' })
    await expect(mail).toContainText("Today's word: 爱护")
    await expect(mail).toContainText('我们要爱护环境。')
    await expect(mail).toContainText('Wǒmen yào àihù huánjìng.')
    await expect(mail).toContainText('We should take care of the environment.')
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One Chinese word a day.')
})

test('launch: leads with the daily word, has no launching-soon notes, previews the heroes', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?home=launch')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One Chinese word a day.')
  await expect(page.getByText('A new word arrives by email each morning, with a short quiz to help it stick.')).toBeVisible()
  await expect(page.getByText('Climb the mountain.')).toHaveCount(0)
  await expect(page.getByText('替天行道')).toHaveCount(0)
  await expect(page.getByText('Launching soon')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Coming soon: collect the 108 heroes of Liangshan.' })).toBeVisible()
  // Study is only what exists: quizzes, and a real link to review.
  await expect(page.getByRole('heading', { level: 3, name: 'Take quizzes.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Review past words.' })).toHaveAttribute('href', '/review')
  await expect(page.getByRole('heading', { name: /catalogue/i })).toHaveCount(0)
})

test('heroes: the full page, with five launching-soon notes', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/?home=heroes')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Climb the mountain.')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Unite the 108.')
  // Catalogue, upload, sentences, writing and quests.
  await expect(page.getByText('Launching soon', { exact: true })).toHaveCount(5)
  await expect(page.getByRole('heading', { name: 'Choose from a catalogue.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Upload your own list.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Collect heroes.' })).toBeVisible()
  await expect(page.getByText('花和尚')).toBeVisible()
})
