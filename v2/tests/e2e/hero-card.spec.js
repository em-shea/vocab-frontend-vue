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
const SPRITE_SCALE = { A: 3, B: 4, C: 2 }
const ALL_IDS = ['B-quote', 'B-flip', 'B-front', 'B-back', 'B-locked', 'B-stress', 'A-front', 'A-locked', 'A-earthly', 'A-stress', 'C-front', 'C-locked', 'C-earthly', 'C-stress']

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
  for (const id of ['B-flip', 'B-front', 'B-back', 'B-locked', 'B-quote', 'A-front', 'A-locked', 'A-earthly', 'A-stress', 'C-front', 'C-locked', 'C-earthly', 'C-stress', 'B-stress']) {
    await expect(lab(page, id), id).toHaveCount(1)
    await expect(card(page, id), id).toHaveCount(1)
  }
})

for (const L of LAYOUTS) {
  test(`${L}: a revealed card shows nickname then name, the subline, star and weapon, and no quote`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-front`)
    await expect(c.getByRole('heading', { name: '关胜' })).toBeVisible()
    expect(await c.locator('.nick__zh').textContent()).toBe('大刀')
    // English subline: the curly-quoted nickname first, then the pinyin.
    await expect(c.locator('.pinyin')).toHaveText('“Great Blade” Guān Shèng')
    expect(await c.locator('.pinyin').textContent()).toMatch(/^\u201CGreat Blade\u201D Guān Shèng$/)
    // Star and weapon are on every front, and the quote is not.
    await expect(c).toContainText('天勇星')
    await expect(c).toContainText('青龙偃月刀')
    if (L !== 'C') {
      await expect(c.locator('dl.facts > div')).toHaveCount(2)
      await expect(c.locator('dl.facts')).toContainText('the Brave Star')
      await expect(c.locator('dl.facts')).toContainText('Green Dragon Crescent Blade')
    }
    await expect(c.locator('blockquote')).toHaveCount(0)
    await expect(c.locator('figure')).toHaveCount(0)
    expect(await visibleText(c)).not.toMatch(/幼读兵书|ten thousand|Xuan Zan/)
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

  test(`${L}: Guan Sheng's sprite is shifted so the body, not the weapon, is centred`, async ({ page }) => {
    await open(page)
    const sp = card(page, `${L}-front`).locator('.sprite')
    const dx = (32 - 29) * SPRITE_SCALE[L]
    const t = await sp.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    expect(t).toBe(dx)
    // The empty headroom rows are pulled up, whole pixels at the sprite scale.
    expect(await sp.evaluate((el) => parseFloat(getComputedStyle(el).marginTop))).toBe(-21 * SPRITE_SCALE[L])
    // A hero without the fields (Hu Sanniang, placeholder) stays at the defaults.
    if (L !== 'B') {
      const hu = card(page, `${L}-earthly`).locator('.sprite')
      expect(await hu.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)).toBe(0)
      expect(await hu.evaluate((el) => parseFloat(getComputedStyle(el).marginTop))).toBe(0)
    }
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

test('full art: the sprite figure sits between the plates, its bottom clear of the quote plate', async ({ page }) => {
  await open(page)
  for (const id of ['B-front', 'B-stress']) {
    const c = card(page, id)
    const face = await c.locator('.face--front').boundingBox()
    const top = await c.locator('.plate--name').boundingBox()
    const bottom = await c.locator('.plate--info').boundingBox()
    const sprite = await c.locator('.sprite').boundingBox()
    // The empty headroom rows may pass behind the name plate; the drawn part may not.
    const drawnTop = sprite.y + 21 * 4
    expect(drawnTop).toBeGreaterThanOrEqual(top.y + top.height - 1)
    expect(sprite.y + sprite.height).toBeLessThanOrEqual(bottom.y)
    // The body is on the centre line (shifted by 3 sprite pixels, 12px).
    expect(Math.abs(sprite.x + sprite.width / 2 - 12 - (face.x + face.width / 2))).toBeLessThan(1.5)
    expect(sprite.x).toBeGreaterThanOrEqual(face.x)
    expect(sprite.x + sprite.width).toBeLessThanOrEqual(face.x + face.width)
  }
})

test('star and weapon are on the front and not on the back', async ({ page }) => {
  await open(page)
  const f = card(page, 'B-front')
  await expect(f.locator('dl.facts > div')).toHaveCount(2)
  await expect(f.locator('dl.facts')).toContainText('天勇星')
  await expect(f.locator('dl.facts')).toContainText('青龙偃月刀')
  const b = card(page, 'B-back')
  await expect(b.locator('dl')).toHaveCount(0)
  expect(await visibleText(b)).not.toMatch(/天勇星|青龙偃月刀|Brave Star|Crescent/)
  // The flippable card keeps them on its front only.
  const fl = card(page, 'B-flip')
  await expect(fl.locator('.face--front dl.facts')).toHaveCount(1)
  await expect(fl.locator('.face--back dl')).toHaveCount(0)
  // Locked fronts leak neither.
  await expect(card(page, 'B-locked').locator('dl')).toHaveCount(0)
})

test('the quote is off by default and comes back with showQuote', async ({ page }) => {
  await open(page)
  for (const id of ['A-front', 'B-front', 'C-front', 'B-flip']) await expect(card(page, id).locator('blockquote'), id).toHaveCount(0)
  const c = card(page, 'B-quote')
  await expect(c.locator('blockquote')).toHaveText(QUOTE_CN)
  await expect(c.locator('figcaption')).toHaveText(SOURCE_EN)
  await expect(c).toContainText(QUOTE_EN)
  await expect(c.locator('dl.facts')).toHaveCount(1)
})

test('the rank seal is round and vermilion for Heavenly Spirits, square and navy for Earthly Fiends', async ({ page }) => {
  await open(page)
  const style = (id) => card(page, id).locator('.seal').first().evaluate((el) => {
    const cs = getComputedStyle(el)
    const b = el.getBoundingClientRect()
    return { radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, w: b.width, h: b.height, text: el.textContent.trim() }
  })
  for (const id of ['A-front', 'B-front', 'C-front', 'A-locked', 'B-locked', 'C-locked', 'B-stress']) {
    const st = await style(id)
    expect(st.radius, id).toBe('50%')
    expect(st.bg, id).toBe('rgb(200, 50, 30)')
    expect(Math.abs(st.w - st.h), id).toBeLessThan(0.5)
    expect(st.text, id).toMatch(/^(5|6)$/)
  }
  for (const id of ['A-earthly', 'C-earthly']) {
    const st = await style(id)
    expect(st.radius, id).toBe('0px')
    expect(st.bg, id).toBe('rgb(27, 33, 64)')
    expect(Math.abs(st.w - st.h), id).toBeLessThan(0.5)
    expect(st.text, id).toBe('59')
  }
  // Sizes: 2.75rem, and 2rem in compact.
  expect((await style('A-front')).w).toBe(44)
  expect((await style('C-front')).w).toBe(32)
})

// Ground shadow ----------------------------------------------------------------

test('there is no plinth bar, and a drop shadow sits under the feet on the centre line', async ({ page }) => {
  await open(page)
  for (const L of LAYOUTS) {
    const c = card(page, `${L}-front`)
    for (const sel of ['.window', '.figure']) {
      if (await c.locator(sel).count()) {
        expect(await c.locator(sel).evaluate((el) => getComputedStyle(el, '::after').content), `${L} ${sel}`).toMatch(/^(none|normal)$/)
      }
    }
  }
  for (const id of ['A-front', 'A-earthly', 'B-front', 'B-stress', 'C-front', 'C-earthly']) {
    const c = card(page, id)
    const shade = c.locator('.shade')
    await expect(shade, id).toHaveCount(1)
    const L = id[0]
    const k = SPRITE_SCALE[L]
    const sb = await shade.boundingBox()
    const face = await c.locator('.face--front').boundingBox()
    const anchor = L === 'C' ? await c.locator('.window').boundingBox() : face
    expect(Math.abs(sb.x + sb.width / 2 - (anchor.x + anchor.width / 2)), id).toBeLessThanOrEqual(2)
    expect(Math.abs(sb.width - 24 * k), id).toBeLessThanOrEqual(1)
    expect(Math.abs(sb.height - 4 * k), id).toBeLessThanOrEqual(1)
    expect(await shade.evaluate((el) => getComputedStyle(el).backgroundColor), id).toBe('rgba(27, 33, 64, 0.45)')
    // Its centre sits at the feet row of the sprite (63 by default; Guan Sheng's is 58).
    const sp = await c.locator('.sprite').boundingBox()
    const feetRow = id.includes('earthly') ? 63 : 58
    const feetY = sp.y + (feetRow + 0.5) * k
    expect(Math.abs(sb.y + sb.height / 2 - feetY), id).toBeLessThanOrEqual(1.5)
  }
  for (const id of ['A-locked', 'B-locked', 'C-locked']) await expect(card(page, id).locator('.shade'), id).toHaveCount(0)
})

test('the back has no sprite shadow', async ({ page }) => {
  await open(page)
  await expect(card(page, 'B-back').locator('.shade')).toHaveCount(0)
})

// Proportions and fit --------------------------------------------------------

const FACE_IDS = ['B-flip', 'B-front', 'B-back', 'B-locked', 'B-stress', 'A-front', 'A-locked', 'A-earthly', 'A-stress']

test('full art and framed faces are 63:88 trading cards, front and back the same', async ({ page }) => {
  await open(page)
  for (const id of FACE_IDS) {
    const faces = card(page, id).locator('.face')
    const n = await faces.count()
    for (let i = 0; i < n; i++) {
      const b = await faces.nth(i).boundingBox()
      expect(Math.abs(b.height - (b.width * 88) / 63), `${id} face ${i}`).toBeLessThanOrEqual(1)
      expect(b.width, id).toBeLessThanOrEqual(320.5)
    }
  }
  const f = await card(page, 'B-flip').locator('.face--front').boundingBox()
  const k = await card(page, 'B-flip').locator('.face--back').boundingBox()
  expect(Math.abs(f.height - k.height)).toBeLessThan(1)
})

for (const lang of ['en', 'cn']) {
  test(`${lang}: nothing in any card face overflows the face`, async ({ page }) => {
    await open(page, lang)
    // The flippable card's back is checked on its own static copy (B-back); the
    // hidden face of B-flip is checked too, since it is still laid out.
    const bad = await page.evaluate((ids) => {
      const out = []
      for (const id of ids) {
        const root = document.querySelector(`[data-lab-id="${id}"]`)
        for (const face of root.querySelectorAll('.face')) {
          const fb = face.getBoundingClientRect()
          // The inside of the border box.
          const bw = parseFloat(getComputedStyle(face).borderLeftWidth)
          for (const el of face.querySelectorAll('*')) {
            if (el.closest('.sr-only') || el.classList.contains('sr-only')) continue
            // The sprite's own box may hang above its figure (headroom, transparent).
            if (el.classList.contains('sprite')) continue
            // Art layers fill the face by design.
            if (el.closest('.stage, .backprint, .window')) continue
            const r = el.getBoundingClientRect()
            if (r.width === 0 && r.height === 0) continue
            const tol = 0.75
            if (r.left < fb.left + bw - tol || r.right > fb.right - bw + tol || r.top < fb.top + bw - tol || r.bottom > fb.bottom - bw + tol) {
              out.push(`${id} ${face.className} <${el.tagName.toLowerCase()} class="${el.className}"> ${Math.round(r.left - fb.left)},${Math.round(r.top - fb.top)} ${Math.round(r.width)}x${Math.round(r.height)} in ${Math.round(fb.width)}x${Math.round(fb.height)}`)
            }
          }
          // Scrollable overflow: nothing hidden behind overflow:hidden.
          if (face.scrollHeight > face.clientHeight + 1 || face.scrollWidth > face.clientWidth + 1) out.push(`${id} ${face.className} scrolls ${face.scrollWidth}x${face.scrollHeight} vs ${face.clientWidth}x${face.clientHeight}`)
        }
      }
      return out
    }, ALL_IDS)
    expect(bad).toEqual([])
  })
}

test('the print band on the back keeps at least 6rem', async ({ page }) => {
  await open(page)
  for (const lang of ['en', 'cn']) {
    await page.goto(`/hero-card?lang=${lang}`)
    const h = await card(page, 'B-back').locator('.backprint').boundingBox()
    expect(h.height, lang).toBeGreaterThanOrEqual(96)
  }
})

test('nickname and name are one title: same size, colour and font', async ({ page }) => {
  await open(page)
  for (const id of ['A-front', 'A-stress', 'B-front', 'B-stress', 'B-back', 'C-front', 'C-stress']) {
    const [a, b] = await card(page, id).evaluate((el) => ['.nick__zh', '.name'].map((q) => {
      const cs = getComputedStyle(el.querySelector(q))
      return { size: cs.fontSize, color: cs.color, family: cs.fontFamily }
    }))
    expect(a, id).toEqual(b)
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

test('the Chinese interface shows the Chinese quote and source (showQuote), pinyin only under the name', async ({ page }) => {
  await open(page, 'cn')
  const c = card(page, 'B-quote')
  await expect(c.locator('blockquote')).toHaveText(QUOTE_CN)
  await expect(c.locator('figcaption')).toHaveText('宣赞荐关胜')
  await expect(c).not.toContainText('ten thousand')
  await expect(c).not.toContainText('Great Blade')
  await expect(c.locator('.pinyin')).toHaveText('Guān Shèng')
  // Star and weapon: Chinese only, no English gloss.
  await expect(card(page, 'B-front').locator('dl.facts')).toContainText('天勇星')
  await expect(card(page, 'B-front').locator('dl.facts')).not.toContainText('Brave Star')
})

// Back and flip -------------------------------------------------------------

test('the back shows the print at full strength, the name line, the story and the credit, and nothing else', async ({ page }) => {
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
    await expect(c.locator('dl.facts')).toBeVisible()
  })
})
