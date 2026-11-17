import { test, expect } from '@playwright/test'
import { mockBackend } from './support/backend'

// The hero card preview page. Each of the three layouts is shown revealed and
// locked with Guan Sheng; A and C also show Hu Sanniang, an Earthly Fiend with
// a four-frame placeholder sprite and no quote.

const OPTIONS = ['a', 'b', 'c']
const QUOTE_CN = '幼读兵书，深通武艺，有万夫不当之勇。'
const QUOTE_EN = 'He read books on war as a boy, mastered the martial arts, and has the courage to stand against ten thousand men.'
const SOURCE_EN = 'Xuan Zan, recommending him to the court'

async function open (page, lang = 'en') {
  await mockBackend(page)
  await page.goto(`/hero-card?lang=${lang}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

// The card's text with the visually hidden (screen reader) parts removed.
const visibleText = (card) => card.evaluate((el) => {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('.sr-only').forEach((n) => n.remove())
  return clone.textContent
})

for (const opt of OPTIONS) {
  test(`option ${opt.toUpperCase()}: a revealed card shows name, nickname beside it, and the quote`, async ({ page }) => {
    await open(page)
    const card = page.locator(`[data-option="${opt}"] article`).first()
    await expect(card.getByRole('heading', { name: '关胜' })).toBeVisible()
    // The nickname sits on the same line as the name.
    const nameBox = await card.getByRole('heading', { name: '关胜' }).boundingBox()
    const nickBox = await card.locator('.nick__zh').boundingBox()
    expect(await card.locator('.nick__zh').textContent()).toBe('大刀')
    expect(nickBox.x).toBeGreaterThan(nameBox.x + nameBox.width - 1)
    expect(Math.abs((nickBox.y + nickBox.height / 2) - (nameBox.y + nameBox.height / 2))).toBeLessThan(nameBox.height / 2)
    await expect(card).toContainText('Guān Shèng · Great Blade')
    await expect(card).toContainText('天勇星')
    await expect(card).toContainText('青龙偃月刀')
    await expect(card.locator('blockquote')).toHaveText(QUOTE_CN)
    await expect(card.locator('blockquote')).toHaveAttribute('lang', 'zh-Hans')
    await expect(card.locator('figcaption')).toHaveText(SOURCE_EN)
    if (opt !== 'c') await expect(card).toContainText(QUOTE_EN)
  })

  test(`option ${opt.toUpperCase()}: a locked card hides the hero`, async ({ page }) => {
    await open(page)
    const card = page.locator(`[data-option="${opt}"] article`).nth(1)
    const html = await card.evaluate((el) => el.outerHTML)
    for (const secret of ['关胜', 'Guan Sheng', 'Guān', '大刀', 'Great Blade', '天勇星', 'Brave Star', '青龙偃月刀', 'Crescent', QUOTE_CN, '幼读兵书', 'ten thousand', 'Xuan Zan', '宣赞荐关胜']) {
      expect(html, secret).not.toContain(secret)
    }
    await expect(card.getByRole('heading')).toHaveText('？？？')
    await expect(card).toContainText('Not yet collected')
    await expect(card.locator('blockquote')).toHaveCount(0)
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

test('A and C keep the footer with rank and tier', async ({ page }) => {
  await open(page)
  for (const opt of ['a', 'c']) {
    const card = page.locator(`[data-option="${opt}"] article`).first()
    await expect(card).toContainText('5 / 108')
    await expect(card).toContainText('天罡')
    await expect(card).toContainText('Heavenly Spirit')
  }
})

test('full art has no visible footer, and keeps rank and tier for screen readers', async ({ page }) => {
  await open(page)
  const cards = page.locator('[data-option="b"] article')
  for (const i of [0, 1]) {
    const card = cards.nth(i)
    const text = await visibleText(card)
    expect(text).not.toContain('5 / 108')
    expect(text).not.toContain('Heavenly Spirit')
    expect(text).not.toContain('天罡')
    await expect(card.locator('footer')).toHaveCount(0)
    await expect(card.locator('.sr-only')).toHaveText('Rank 5 of 108, Heavenly Spirit')
  }
})

test('full art: the sprite sits between the plates and is not covered', async ({ page }) => {
  await open(page)
  const card = page.locator('[data-option="b"] article').first()
  const top = await card.locator('.plate--name').boundingBox()
  const bottom = await card.locator('.plate--info').boundingBox()
  const sprite = await card.locator('.sprite').boundingBox()
  expect(sprite.width).toBe(192)
  expect(sprite.height).toBe(192)
  expect(sprite.y).toBeGreaterThanOrEqual(top.y + top.height)
  expect(sprite.y + sprite.height).toBeLessThanOrEqual(bottom.y)
})

test('the sprite loops by default, with one step per frame', async ({ page }) => {
  await open(page)
  const guan = page.locator('[data-option="a"] article').first().locator('.sprite')
  expect(await guan.evaluate((el) => getComputedStyle(el).animationName)).toMatch(/idle/)
  expect(await guan.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toContain('steps(5')
  expect(await guan.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('960px 192px')
  const hu = page.locator('[data-option="a"] article').nth(2).locator('.sprite')
  expect(await hu.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toContain('steps(4')
  expect(await hu.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('768px 192px')
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

test('a hero with no quote shows no quote block', async ({ page }) => {
  await open(page)
  const hu = page.locator('[data-option="a"] article').nth(2)
  await expect(hu.getByRole('heading', { name: '扈三娘' })).toBeVisible()
  await expect(hu.locator('figure')).toHaveCount(0)
  await expect(hu).toContainText('地煞')
})

test('the Chinese interface shows the Chinese quote and source, not the English', async ({ page }) => {
  await open(page, 'cn')
  const card = page.locator('[data-option="b"] article').first()
  await expect(card.locator('blockquote')).toHaveText(QUOTE_CN)
  await expect(card.locator('figcaption')).toHaveText('宣赞荐关胜')
  await expect(card).not.toContainText('ten thousand')
  await expect(card).not.toContainText('Great Blade')
})
