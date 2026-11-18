import { test, expect } from '@playwright/test'
import { mockBackend } from './support/backend'

// The hero card preview page. Each card on it sits in an element with a stable
// data-lab-id. Guan Sheng is shown revealed and locked in each layout (B also
// shows the back and one flippable card); A and C also show Hu Sanniang, an
// Earthly Fiend with no quote and no story; every layout shows the fake
// stress-test hero (nickname 神行太保, name 公孙胜) to prove the name line
// never wraps. The phone and desktop projects supply the 390 and 1120 viewports.

const LAYOUTS = ['A', 'B', 'C']
const QUOTE_CN = '幼读兵书，深通武艺，有万夫不当之勇。'
const QUOTE_EN = 'He read books on war as a boy, mastered the martial arts, and has the courage to stand against ten thousand men.'
const SOURCE_EN = 'Xuan Zan, recommending him to the court'
const STORY_EN = 'A border patrol officer said to descend from the great general Guan Yu'
const STORY_CN = '关胜相传是关羽的后代'
const CREDIT_EN = 'Utagawa Kuniyoshi, One Hundred and Eight Heroes of the Popular Water Margin, c. 1827–1830. Public domain.'
const SPRITE_PX = { A: 192, B: 256, C: 128 }

async function open (page, lang = 'en') {
  await mockBackend(page)
  await page.goto(`/hero-card?lang=${lang}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

const lab = (page, id) => page.locator(`[data-lab-id="${id}"]`)
const card = (page, id) => lab(page, id).locator('article')

// The card's text with the visually hidden (screen reader) parts removed.
const visibleText = (c) => c.evaluate((el) => {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('.sr-only').forEach((n) => n.remove())
  return clone.textContent
})

test('every lab id is present once', async ({ page }) => {
  await open(page)
  for (const id of ['B-flip', 'B-front', 'B-back', 'B-locked', 'A-front', 'A-locked', 'A-earthly', 'A-stress', 'C-front', 'C-locked', 'C-earthly', 'C-stress', 'B-stress']) {
    await expect(lab(page, id), id).toHaveCount(1)
    await expect(card(page, id), id).toHaveCount(1)
  }
})

for (const L of LAYOUTS) {
  test(`${L}: a revealed card shows nickname then name on one line, and the quote`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-front`)
    await expect(c.getByRole('heading', { name: '关胜' })).toBeVisible()
    expect(await c.locator('.nick__zh').textContent()).toBe('大刀')
    await expect(c).toContainText('Great Blade · Guān Shèng')
    await expect(c).toContainText('天勇星')
    await expect(c).toContainText('青龙偃月刀')
    await expect(c.locator('blockquote')).toHaveText(QUOTE_CN)
    await expect(c.locator('blockquote')).toHaveAttribute('lang', 'zh-Hans')
    await expect(c.locator('figcaption')).toHaveText(SOURCE_EN)
    if (L !== 'C') await expect(c).toContainText(QUOTE_EN)
  })

  for (const [id, name, nick] of [[`${L}-front`, '关胜', '大刀'], [`${L}-stress`, '公孙胜', '神行太保']]) {
    test(`${id}: nickname and name stay on one line, nickname first`, async ({ page }) => {
      await open(page)
      const c = card(page, id)
      const row = c.locator('.namerow')
      const h = c.getByRole('heading', { name })
      const n = c.locator('.nick__zh')
      expect(await n.textContent()).toBe(nick)
      expect(await row.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe('nowrap')
      const rowBox = await row.boundingBox()
      const hBox = await h.boundingBox()
      const nBox = await n.boundingBox()
      // One line: the row is about as tall as the name, and both sit side by side.
      expect(rowBox.height).toBeLessThan(hBox.height * 1.5)
      expect(nBox.x + nBox.width).toBeLessThanOrEqual(hBox.x + 1)
      expect(Math.abs((nBox.y + nBox.height / 2) - (hBox.y + hBox.height / 2))).toBeLessThan(hBox.height / 2)
      // Nothing spills: the row fits its container, the name ends before the seal.
      expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
      const parent = await row.evaluate((el) => el.parentElement.getBoundingClientRect().right)
      expect(hBox.x + hBox.width).toBeLessThanOrEqual(parent + 1)
      const seal = await c.locator('.seal').first().boundingBox()
      expect(hBox.x + hBox.width).toBeLessThanOrEqual(seal.x)
      // The nickname is smaller than the name.
      const sizes = await c.evaluate((el) => [getComputedStyle(el.querySelector('.nick__zh')).fontSize, getComputedStyle(el.querySelector('.name')).fontSize].map(parseFloat))
      expect(sizes[0]).toBeLessThan(sizes[1])
    })
  }

  test(`${L}: a locked card hides the hero, the story and the credit, and has no flip button`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-locked`)
    const html = await c.evaluate((el) => el.outerHTML)
    for (const secret of ['关胜', 'Guan Sheng', 'Guān', '大刀', 'Great Blade', '天勇星', 'Brave Star', '青龙偃月刀', 'Crescent', QUOTE_CN, '幼读兵书', 'ten thousand', 'Xuan Zan', '宣赞荐关胜', 'Guan Yu', '关羽', 'Song Jiang', 'Kuniyoshi', '歌川', 'Tiger']) {
      expect(html, secret).not.toContain(secret)
    }
    await expect(c.getByRole('heading')).toHaveText('？？？')
    await expect(c).toContainText('Not yet collected')
    await expect(c.locator('blockquote')).toHaveCount(0)
    await expect(c.getByRole('button')).toHaveCount(0)
    await expect(c.locator('.face--back')).toHaveCount(0)
  })

  test(`${L}: every card's art has an accessible label`, async ({ page }) => {
    await open(page)
    for (const id of [`${L}-front`, `${L}-locked`, `${L}-stress`]) {
      const art = card(page, id).getByRole('img')
      await expect(art, id).toHaveCount(1)
      expect(((await art.getAttribute('aria-label')) ?? '').length).toBeGreaterThan(10)
    }
  })

  test(`${L}: the sprite is ${SPRITE_PX[L]}px`, async ({ page }) => {
    await open(page)
    const s = await card(page, `${L}-front`).locator('.sprite').boundingBox()
    expect(s.width).toBe(SPRITE_PX[L])
    expect(s.height).toBe(SPRITE_PX[L])
  })

  test(`${L}: the front print is washed back, and more so when locked`, async ({ page }) => {
    await open(page)
    const sel = L === 'B' ? '.stage__print' : '.window__print'
    const op = (id) => card(page, id).locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).opacity))
    expect(await op(`${L}-front`)).toBeCloseTo(0.4, 2)
    expect(await op(`${L}-locked`)).toBeLessThan(await op(`${L}-front`))
  })
}

test('A and C keep the footer with rank and tier', async ({ page }) => {
  await open(page)
  for (const L of ['A', 'C']) {
    const c = card(page, `${L}-front`)
    await expect(c).toContainText('5 / 108')
    await expect(c).toContainText('天罡')
    await expect(c).toContainText('Heavenly Spirit')
  }
})

test('full art has no visible footer, and keeps rank and tier for screen readers', async ({ page }) => {
  await open(page)
  for (const id of ['B-front', 'B-locked']) {
    const c = card(page, id)
    const text = await visibleText(c)
    expect(text).not.toContain('5 / 108')
    expect(text).not.toContain('Heavenly Spirit')
    expect(text).not.toContain('天罡')
    await expect(c.locator('footer')).toHaveCount(0)
    await expect(c.locator('.sr-only')).toHaveText('Rank 5 of 108, Heavenly Spirit')
  }
})

test('full art: the 256px sprite sits between the plates and inside the card', async ({ page }) => {
  await open(page)
  for (const id of ['B-front', 'B-stress']) {
    const c = card(page, id)
    const face = await c.locator('.face--front').boundingBox()
    const top = await c.locator('.plate--name').boundingBox()
    const bottom = await c.locator('.plate--info').boundingBox()
    const sprite = await c.locator('.sprite').boundingBox()
    expect(sprite.y).toBeGreaterThanOrEqual(top.y + top.height)
    expect(sprite.y + sprite.height).toBeLessThanOrEqual(bottom.y)
    expect(sprite.x).toBeGreaterThanOrEqual(face.x)
    expect(sprite.x + sprite.width).toBeLessThanOrEqual(face.x + face.width)
  }
})

test('the sprite loops by default, with one step per frame', async ({ page }) => {
  await open(page)
  const guan = card(page, 'A-front').locator('.sprite')
  expect(await guan.evaluate((el) => getComputedStyle(el).animationName)).toMatch(/idle/)
  expect(await guan.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toContain('steps(5')
  expect(await guan.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('960px 192px')
  const hu = card(page, 'A-earthly').locator('.sprite')
  expect(await hu.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toContain('steps(4')
  expect(await hu.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('768px 192px')
  const big = card(page, 'B-front').locator('.sprite')
  expect(await big.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('1280px 256px')
})

test('a hero with no quote shows no quote block', async ({ page }) => {
  await open(page)
  const hu = card(page, 'A-earthly')
  await expect(hu.getByRole('heading', { name: '扈三娘' })).toBeVisible()
  await expect(hu.locator('figure')).toHaveCount(0)
  await expect(hu).toContainText('地煞')
  await expect(hu.getByRole('button')).toHaveCount(0)
})

test('the Chinese interface shows the Chinese quote and source, pinyin only under the name', async ({ page }) => {
  await open(page, 'cn')
  const c = card(page, 'B-front')
  await expect(c.locator('blockquote')).toHaveText(QUOTE_CN)
  await expect(c.locator('figcaption')).toHaveText('宣赞荐关胜')
  await expect(c).not.toContainText('ten thousand')
  await expect(c).not.toContainText('Great Blade')
  await expect(c.locator('.pinyin')).toHaveText('Guān Shèng')
})

// Back and flip -------------------------------------------------------------

test('the back shows the print at full strength, the name line, the story and the credit', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-back')
  await expect(c.locator('.face--front')).toHaveCount(0)
  await expect(c.locator('.sprite')).toHaveCount(0)
  await expect(c.locator('.story')).toHaveText(new RegExp('^' + STORY_EN))
  await expect(c.locator('.credit')).toHaveText(CREDIT_EN)
  await expect(c.getByRole('heading', { name: '关胜' })).toBeVisible()
  expect(await c.locator('.nick__zh').textContent()).toBe('大刀')
  // No opacity reduction on the print or anything above it.
  const ops = await c.locator('.backprint__img').evaluate((el) => {
    const out = []
    for (let n = el; n && n !== document.body; n = n.parentElement) out.push(parseFloat(getComputedStyle(n).opacity))
    return out
  })
  expect(ops.every((o) => o === 1)).toBe(true)
  expect(await c.locator('.backprint__img').evaluate((el) => getComputedStyle(el).filter)).toBe('none')
  // The print says nothing about who it shows.
  expect(await c.getByRole('img').getAttribute('aria-label')).not.toMatch(/Guan/)
  expect(await visibleText(c)).not.toMatch(/shows Guan|depicts/i)
})

test('the back shows the Chinese story in Chinese', async ({ page }) => {
  await open(page, 'cn')
  const c = card(page, 'B-back')
  await expect(c.locator('.story')).toContainText(STORY_CN)
  await expect(c.locator('.credit')).toContainText('歌川国芳')
  await expect(c).not.toContainText('border patrol')
})

test('the front and back are the same size', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-flip')
  const f = await c.locator('.face--front').boundingBox()
  const b = await c.locator('.face--back').boundingBox()
  expect(Math.abs(f.width - b.width)).toBeLessThan(1)
  expect(Math.abs(f.height - b.height)).toBeLessThan(1)
})

test('the flip button turns the card, by keyboard too, and hides the unseen face from assistive tech', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-flip')
  const btn = c.getByRole('button', { name: 'Flip card' })
  await expect(btn).toBeVisible()
  await expect(btn).toHaveAttribute('aria-pressed', 'false')
  const front = c.locator('.face--front')
  const back = c.locator('.face--back')
  await expect(back).toHaveAttribute('aria-hidden', 'true')
  expect(await back.evaluate((el) => el.inert)).toBe(true)
  expect(await front.evaluate((el) => el.inert)).toBe(false)
  await expect(c.getByRole('heading', { name: '关胜' })).toHaveCount(1)
  await expect(c.getByRole('paragraph').filter({ hasText: STORY_EN })).toHaveCount(0)

  await btn.focus()
  await page.keyboard.press('Enter')
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
  await expect(front).toHaveAttribute('aria-hidden', 'true')
  expect(await front.evaluate((el) => el.inert)).toBe(true)
  expect(await back.evaluate((el) => el.inert)).toBe(false)
  await expect(back).not.toHaveAttribute('aria-hidden', 'true')
  await expect(c.getByText(STORY_EN, { exact: false })).toBeVisible()
  await expect(c.getByRole('status')).toHaveText('Showing the back of the card')
  // Turned over in 3D.
  await page.waitForTimeout(700)
  expect(await c.locator('.flip').evaluate((el) => getComputedStyle(el).transform)).not.toBe('none')

  await page.keyboard.press('Space')
  await expect(btn).toHaveAttribute('aria-pressed', 'false')
  await expect(c.getByRole('status')).toHaveText('Showing the front of the card')
  await expect(c.getByRole('paragraph').filter({ hasText: STORY_EN })).toHaveCount(0)
})

test('the flip button reads in Chinese', async ({ page }) => {
  await open(page, 'cn')
  const c = card(page, 'B-flip')
  await c.getByRole('button', { name: '翻转卡片' }).click()
  await expect(c.getByText(STORY_CN, { exact: false })).toBeVisible()
})

test('Hu Sanniang has no story and no flip button; the other flippable options need a story too', async ({ page }) => {
  await open(page)
  for (const id of ['A-earthly', 'C-earthly', 'A-stress', 'B-stress']) {
    await expect(card(page, id).getByRole('button'), id).toHaveCount(0)
  }
  await expect(lab(page, 'B-flip').getByRole('button')).toHaveCount(1)
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

  test('the flip still works, with no rotation', async ({ page }) => {
    await open(page)
    const c = card(page, 'B-flip')
    const btn = c.getByRole('button', { name: 'Flip card' })
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await expect(c.getByText(STORY_EN, { exact: false })).toBeVisible()
    for (const sel of ['.flip', '.face--front', '.face--back']) {
      expect(await c.locator(sel).evaluate((el) => getComputedStyle(el).transform), sel).toBe('none')
    }
    expect(await c.locator('.face--front').evaluate((el) => el.inert)).toBe(true)
    await expect(c.getByRole('heading', { name: '关胜' })).toHaveCount(1)
    await btn.click()
    await expect(c.getByRole('paragraph').filter({ hasText: STORY_EN })).toHaveCount(0)
    await expect(c.locator('blockquote')).toBeVisible()
  })
})
