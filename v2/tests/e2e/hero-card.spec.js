import { test, expect } from '@playwright/test'
import { mockBackend } from './support/backend'

// The hero card preview page. Each of the three layouts is shown revealed and
// locked; A and C also show an Earthly Fiend.

const OPTIONS = ['a', 'b', 'c']

async function open (page, lang = 'en') {
  await mockBackend(page)
  await page.goto(`/hero-card?lang=${lang}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

for (const opt of OPTIONS) {
  test(`option ${opt.toUpperCase()}: a revealed card shows name, nickname and rank`, async ({ page }) => {
    await open(page)
    const card = page.locator(`[data-option="${opt}"] article`).first()
    await expect(card.getByRole('heading', { name: '鲁智深' })).toBeVisible()
    await expect(card).toContainText('花和尚')
    await expect(card).toContainText('13 / 108')
    await expect(card).toContainText('天罡')
  })

  test(`option ${opt.toUpperCase()}: a locked card hides the hero and keeps the rank`, async ({ page }) => {
    await open(page)
    const card = page.locator(`[data-option="${opt}"] article`).nth(1)
    const html = await card.evaluate((el) => el.outerHTML)
    for (const secret of ['鲁智深', 'Lu Zhishen', '花和尚', 'Flowery', '禅杖', '天孤星']) {
      expect(html, secret).not.toContain(secret)
    }
    await expect(card.getByRole('heading')).toHaveText('？？？')
    await expect(card).toContainText('13 / 108')
  })

  test(`option ${opt.toUpperCase()}: every card's art has an accessible label`, async ({ page }) => {
    await open(page)
    const cards = page.locator(`[data-option="${opt}"] article`)
    const n = await cards.count()
    expect(n).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < n; i++) {
      const art = cards.nth(i).getByRole('img')
      await expect(art).toHaveCount(1)
      expect(((await art.getAttribute('aria-label')) ?? '').length).toBeGreaterThan(10)
    }
  })
}

test('the sprite loops by default', async ({ page }) => {
  await open(page)
  const sprite = page.locator('[data-option="a"] article').first().locator('.sprite')
  expect(await sprite.evaluate((el) => getComputedStyle(el).animationName)).toMatch(/idle/)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('the sprite does not animate', async ({ page }) => {
    await open(page)
    const sprites = page.locator('article .sprite')
    const n = await sprites.count()
    expect(n).toBeGreaterThan(0)
    for (let i = 0; i < n; i++) {
      expect(await sprites.nth(i).evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    }
  })
})

test('the Chinese interface shows the Chinese line, not the English one', async ({ page }) => {
  await open(page, 'cn')
  const card = page.locator('[data-option="a"] article').first()
  await expect(card).toContainText('一个喝酒打架')
  await expect(card).not.toContainText('A monk who drinks')
})
