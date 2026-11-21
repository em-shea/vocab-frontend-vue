import { test, expect } from '@playwright/test'
import { mockBackend } from './support/backend'

// The hero card preview page. Each card on it sits in an element with a stable
// data-lab-id. Guan Sheng is shown revealed and locked in each layout (B also
// shows the back and one flippable card); A and C also show Hu Sanniang, an
// Earthly Fiend with no quote and no story; every layout shows the fake
// stress-test hero (nickname 神行太保, name 公孙胜) to prove the name line
// never wraps. Each layout also has an immersive (Chinese only) card, ids ending
// -imm; B has a front and a back. The rest are guided (pinyin and English).
// The phone and desktop projects supply the 390 and 1120 viewports.

const LAYOUTS = ['A', 'B', 'C']
const QUOTE_CN = '幼读兵书，深通武艺，有万夫不当之勇。'
const QUOTE_EN = 'He read books on war as a boy, mastered the martial arts, and has the courage to stand against ten thousand men.'
const SOURCE_EN = 'Xuan Zan, recommending him to the court'
const STORY_EN = 'Said to descend from the great general Guan Yu, he was sent to crush Liangshan. Huyan Zhuo pretended to defect'
const STORY_CN = '关胜相传是关羽后代'
const CREDIT_EN = 'Utagawa Kuniyoshi, One Hundred and Eight Heroes of the Popular Water Margin, c. 1827–1830. Public domain.'
const SPRITE_PX = { A: 256, B: 320, C: 128 }
const SPRITE_SCALE = { A: 4, B: 5, C: 2 }
// Fixed art heights (rem x 16): full art's figure, and the framed art window (border box).
const ART_H = { B: 224, A: 192 }
// Guan Sheng's sprite: the drawn part runs from row 21 to the feet on row 58, and from column 16 to 57 (the glaive).
const GUAN = { top: 21, left: 16, right: 57 }
// The words of each Chinese line: the syllables of a word joined are its pop-up text.
const GUAN_WORDS = {
  star: [['天勇', 'tiānyǒng'], ['星', 'xīng']],
  weapon: [['青龙', 'qīnglóng'], ['偃月刀', 'yǎnyuèdāo']],
  background: [['蒲东', 'Púdōng'], ['巡检', 'xúnjiǎn']]
}
const HU_WORDS = {
  star: [['地慧', 'dìhuì'], ['星', 'xīng']],
  weapon: [['日月', 'rìyuè'], ['双刀', 'shuāngdāo']],
  background: [['扈家庄', 'Hùjiāzhuāng'], ['庄主', 'zhuāngzhǔ'], ['之', 'zhī'], ['女', 'nǚ']]
}
const QUOTE_WORDS = [['幼', 'yòu'], ['读', 'dú'], ['兵书', 'bīngshū'], ['深通', 'shēntōng'], ['武艺', 'wǔyì'], ['有', 'yǒu'], ['万夫', 'wànfū'], ['不当', 'bùdāng'], ['之', 'zhī'], ['勇', 'yǒng']]
const ALL_IDS = ['B-flip', 'B-front', 'B-back', 'B-front-imm', 'B-back-imm', 'B-locked', 'B-stress', 'A-front', 'A-front-imm', 'A-locked', 'A-earthly', 'A-stress', 'C-front', 'C-front-imm', 'C-locked', 'C-earthly', 'C-stress']
const IMM_IDS = ['B-front-imm', 'B-back-imm', 'A-front-imm', 'C-front-imm']

async function open (page, lang = 'en') {
  await mockBackend(page)
  await page.goto(`/hero-card?lang=${lang}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // Layout checks measure text, so wait until every web font in use has loaded:
  // under load the fallback face (wider glyphs) can still be showing.
  await page.evaluate(async () => { await document.fonts.ready })
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
  for (const id of ALL_IDS) {
    await expect(lab(page, id), id).toHaveCount(1)
    await expect(card(page, id), id).toHaveCount(1)
  }
})

for (const L of LAYOUTS) {
  test(`${L}: a revealed card shows nickname then name, the subline, star, weapon and background, and no quote`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-front`)
    await expect(c.getByRole('heading', { name: '关胜' })).toBeVisible()
    expect(await c.locator('.nick__zh').textContent()).toBe('大刀')
    // The subline: the curly-quoted nickname first, then the pinyin.
    await expect(c.locator('.pinyin')).toHaveText('“Great Blade” Guān Shèng')
    expect(await c.locator('.pinyin').textContent()).toMatch(/^\u201CGreat Blade\u201D Guān Shèng$/)
    // Star, weapon and background are on every front, in that order, and the quote is not.
    await expect(c).toContainText('天勇星')
    await expect(c).toContainText('青龙偃月刀')
    await expect(c).toContainText('蒲东巡检')
    if (L !== 'C') {
      await expect(c.locator('dl.facts > div')).toHaveCount(3)
      await expect(c.locator('dl.facts > div').evaluateAll((els) => els.map((e) => e.dataset.fact))).resolves.toEqual(['star', 'weapon', 'background'])
      await expect(c.locator('dl.facts dt')).toHaveText(['Star', 'Weapon', 'Background'])
      await expect(c.locator('dl.facts')).toContainText('the Brave Star')
      await expect(c.locator('dl.facts')).toContainText('Green Dragon Crescent Blade')
      await expect(c.locator('dl.facts')).toContainText('Patrol officer of Pudong')
    } else {
      await expect(c.locator('.meta__item')).toHaveCount(3)
      await expect(c.locator('.meta')).toContainText('Patrol officer of Pudong')
    }
    await expect(c.locator('blockquote')).toHaveCount(0)
    await expect(c.locator('figure')).toHaveCount(0)
    expect(await visibleText(c)).not.toMatch(/幼读兵书|ten thousand|Xuan Zan|yòu dú/)
  })

  for (const [id, name, nick] of [[`${L}-front`, '关胜', '大刀'], [`${L}-front-imm`, '关胜', '大刀'], [`${L}-stress`, '公孙胜', '神行太保']]) {
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
      // Nothing spills: the row fits its container, the name ends before the emblem.
      expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
      const parent = await row.evaluate((el) => el.parentElement.getBoundingClientRect().right)
      expect(hBox.x + hBox.width).toBeLessThanOrEqual(parent + 1)
      const seal = await c.locator('[data-tier]').first().boundingBox()
      expect(hBox.x + hBox.width).toBeLessThanOrEqual(seal.x)
    })
  }

  test(`${L}: a locked card hides the hero, the story and the credit, and has no flip button`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-locked`)
    const html = await c.evaluate((el) => el.outerHTML)
    for (const secret of ['关胜', 'Guan Sheng', 'Guān', '大刀', 'Great Blade', '天勇星', 'Brave Star', '青龙偃月刀', 'Crescent', QUOTE_CN, '幼读兵书', 'ten thousand', 'Xuan Zan', '宣赞荐关胜', 'Guan Yu', '关羽', 'Song Jiang', 'Kuniyoshi', '歌川', 'Tiger', '蒲东巡检', 'Pudong', 'Patrol', 'Background', 'tiān', 'yòu dú', 'Huyan', '呼延灼']) {
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
    await expect(c.locator('.plate--name .sr-only')).toHaveText('Rank 5 of 108, Heavenly Spirit')
  }
})

test('full art: the sprite figure sits between the plates, its bottom clear of the quote plate', async ({ page }) => {
  await open(page)
  for (const id of ['B-front', 'B-front-imm', 'B-stress']) {
    const c = card(page, id)
    const face = await c.locator('.face--front').boundingBox()
    const top = await c.locator('.plate--name').boundingBox()
    const bottom = await c.locator('.plate--info').boundingBox()
    const sprite = await c.locator('.sprite').boundingBox()
    // The empty headroom rows may pass behind the name plate; the drawn part may not.
    const drawnTop = sprite.y + GUAN.top * 5
    expect(drawnTop).toBeGreaterThanOrEqual(top.y + top.height - 1)
    expect(sprite.y + sprite.height).toBeLessThanOrEqual(bottom.y)
    // The feet (row 58) and the whole foot shadow (to row 60.5) are inside the figure, above the plate.
    const fig = await c.locator('.figure').boundingBox()
    expect(fig.height).toBe(ART_H.B)
    expect(sprite.y + 61 * 5).toBeLessThanOrEqual(fig.y + fig.height)
    const sh = await c.locator('.shade').boundingBox()
    expect(sh.y + sh.height).toBeLessThanOrEqual(bottom.y)
    // The body is on the centre line (shifted by 3 sprite pixels, 15px).
    expect(Math.abs(sprite.x + sprite.width / 2 - 15 - (face.x + face.width / 2))).toBeLessThan(1.5)
    // The sprite box may reach past the figure, but what is drawn (glaive included) stays inside the face's border.
    expect(sprite.x + GUAN.left * 5, id).toBeGreaterThanOrEqual(face.x + 4)
    expect(sprite.x + (GUAN.right + 1) * 5, id).toBeLessThanOrEqual(face.x + face.width - 4)
  }
})

test('star, weapon and background are on the front and not on the back', async ({ page }) => {
  await open(page)
  for (const id of ['B-front', 'B-front-imm']) {
    const f = card(page, id)
    await expect(f.locator('dl.facts > div')).toHaveCount(3)
    await expect(f.locator('dl.facts')).toContainText('天勇星')
    await expect(f.locator('dl.facts')).toContainText('青龙偃月刀')
    await expect(f.locator('dl.facts')).toContainText('蒲东巡检')
  }
  for (const id of ['B-back', 'B-back-imm']) {
    const b = card(page, id)
    await expect(b.locator('dl')).toHaveCount(0)
    expect(await visibleText(b)).not.toMatch(/天勇星|青龙偃月刀|蒲东巡检|Brave Star|Crescent|Pudong/)
  }
  // The flippable card keeps them on its front only.
  const fl = card(page, 'B-flip')
  await expect(fl.locator('.face--front dl.facts')).toHaveCount(1)
  await expect(fl.locator('.face--back dl')).toHaveCount(0)
  // Locked fronts leak none, and have no background row.
  await expect(card(page, 'B-locked').locator('dl')).toHaveCount(0)
  for (const L of LAYOUTS) {
    await expect(card(page, `${L}-locked`).locator('[data-fact="background"]'), L).toHaveCount(0)
    expect(await visibleText(card(page, `${L}-locked`)), L).not.toMatch(/Background|出身|蒲东/)
  }
})

test('the background row: present on every revealed front, guided and immersive, in en and cn', async ({ page }) => {
  for (const lang of ['en', 'cn']) {
    await open(page, lang)
    for (const id of ['A-front', 'B-front', 'C-front', 'A-front-imm', 'B-front-imm', 'C-front-imm', 'A-earthly', 'C-earthly', 'B-stress']) {
      const row = card(page, id).locator('[data-fact="background"]')
      await expect(row, `${lang} ${id}`).toHaveCount(1)
      const zh = id.startsWith('A-earthly') || id.startsWith('C-earthly') ? '扈家庄庄主之女' : '蒲东巡检'
      await expect(row.locator('.sr-only[lang="zh-Hans"], .hl__zh').first(), `${lang} ${id}`).toHaveText(zh)
    }
    // Label: the locale's when guided, always Chinese when immersive.
    await expect(card(page, 'B-front').locator('dl.facts dt').nth(2)).toHaveText(lang === 'en' ? 'Background' : '出身')
    await expect(card(page, 'B-front-imm').locator('dl.facts dt')).toHaveText(['星宿', '兵器', '出身'])
    await expect(card(page, 'A-front-imm').locator('dl.facts dt')).toHaveText(['星宿', '兵器', '出身'])
  }
})

test('the quote is on the back, below the story, and not on the front', async ({ page }) => {
  await open(page)
  for (const id of ['A-front', 'B-front', 'C-front', 'B-front-imm', 'A-front-imm', 'C-front-imm']) await expect(card(page, id).locator('blockquote'), id).toHaveCount(0)
  const fl = card(page, 'B-flip')
  await expect(fl.locator('.face--front blockquote')).toHaveCount(0)
  await expect(fl.locator('.face--back blockquote')).toHaveCount(1)
  const c = card(page, 'B-back')
  await expect(c.locator('blockquote .sr-only[lang="zh-Hans"]')).toHaveText(QUOTE_CN)
  await expect(c.locator('blockquote .hl__en')).toHaveText(QUOTE_EN)
  await expect(c.locator('figcaption')).toHaveText(SOURCE_EN)
  const story = await c.locator('.story').boundingBox()
  const quote = await c.locator('figure.quote').boundingBox()
  const name = await c.locator('.namerow').boundingBox()
  expect(name.y + name.height).toBeLessThanOrEqual(story.y + 1)
  expect(quote.y).toBeGreaterThanOrEqual(story.y + story.height - 1)
  // The English comes after the Chinese, and the source after both.
  const zhBox = await c.locator('blockquote .hl__zh').boundingBox()
  const enBox = await c.locator('blockquote .hl__en').boundingBox()
  const srcBox = await c.locator('figcaption').boundingBox()
  expect(enBox.y).toBeGreaterThanOrEqual(zhBox.y + zhBox.height - 1)
  expect(srcBox.y).toBeGreaterThanOrEqual(enBox.y + enBox.height - 1)
  // Hu Sanniang has no quote and no back.
  await expect(card(page, 'A-earthly').locator('blockquote')).toHaveCount(0)
})

test('the immersive back has the Chinese quote and source, and no English or pinyin', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-back-imm')
  await expect(c.locator('blockquote .hl__zh')).toHaveText(QUOTE_CN)
  await expect(c.locator('figcaption')).toHaveText('宣赞荐关胜')
  await expect(c.locator('.story')).toContainText(STORY_CN)
  await expect(c.locator('.viewer__credit')).toContainText('歌川国芳')
  await expect(c.locator('rt')).toHaveCount(0)
  await expect(c.locator('.pinyin')).toHaveCount(0)
})

// Reading modes ----------------------------------------------------------------

for (const lang of ['en', 'cn']) {
  test(`${lang}: immersive cards have no Latin letters, no pinyin, no subline`, async ({ page }) => {
    await open(page, lang)
    for (const id of IMM_IDS) {
      const c = card(page, id)
      await expect(c.locator('rt'), id).toHaveCount(0)
      await expect(c.locator('.pinyin'), id).toHaveCount(0)
      await expect(c.locator('.hl__en'), id).toHaveCount(0)
      await expect(c.locator('ruby'), id).toHaveCount(0)
      const latin = await c.evaluate((root) => {
        const out = []
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement
          if (el.closest('.sr-only, .flipbtn, .viewer__credit-icons')) continue // the icon credit's names and licence are Latin by requirement
          if (/[A-Za-z]/.test(n.textContent)) out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> ${n.textContent.trim()}`)
        }
        // Nothing Latin in the card's own accessible names either.
        // The flip, expand and close buttons are interface, not card content: they stay in the locale.
        for (const el of root.querySelectorAll('[aria-label]')) if (!el.closest('.flipbtn, .expandbtn, .viewer__close') && /[A-Za-z]/.test(el.getAttribute('aria-label'))) out.push(`aria-label ${el.getAttribute('aria-label')}`)
        for (const el of root.querySelectorAll('.sr-only')) if (/[A-Za-z]/.test(el.textContent)) out.push(`sr-only ${el.textContent}`)
        return out
      })
      expect(latin, `${lang} ${id}`).toEqual([])
    }
    // The name line is nickname then name, with no subline under it.
    await expect(card(page, 'B-front-imm').getByRole('heading', { name: '关胜' })).toBeVisible()
    // Labels are Chinese whatever the locale.
    await expect(card(page, 'B-front-imm').locator('dl.facts dt')).toHaveText(['星宿', '兵器', '出身'])
    await expect(card(page, 'B-front-imm').locator('dl.facts dd')).toHaveText(['天勇星', '青龙偃月刀', '蒲东巡检'])
    // Story and credit in Chinese on the immersive back, in the English locale too.
    await expect(card(page, 'B-back-imm').locator('.story')).toContainText(STORY_CN)
    await expect(card(page, 'B-back-imm').locator('.viewer__credit')).toContainText('歌川国芳')
  })
}

test('immersive footers and locked-card text are Chinese (the flip button is not card content)', async ({ page }) => {
  await open(page)
  for (const id of ['A-front-imm', 'C-front-imm']) {
    const c = card(page, id)
    await expect(c).toContainText('5 / 108')
    await expect(c).toContainText('三十六天罡')
    expect(await visibleText(c)).not.toContain('Heavenly Spirit')
  }
})


test('guided cards: each line is split into word buttons, each with its own joined pinyin, English is present, and there is no ruby', async ({ page }) => {
  const warnings = []
  page.on('console', (m) => { if (m.type() === 'warning' && /HeroLine/.test(m.text())) warnings.push(m.text()) })
  await open(page)
  const check = async (scope, words, label) => {
    const btns = scope.locator('.hl__btn')
    // Word buttons per line equal the word count in the data.
    await expect(btns, label).toHaveCount(words.length)
    for (let i = 0; i < words.length; i++) {
      const [zh, tip] = words[i]
      const w = scope.locator('.hl__w').nth(i)
      await expect(w.locator('.hl__wz'), `${label} ${i}`).toHaveText(zh)
      await expect(w.locator('.hl__tip'), `${label} ${i}`).toHaveText(tip)
      expect(tip, `${label} ${i}`).not.toMatch(/\s/)
      await expect(w.locator('.hl__btn'), `${label} ${i}`).toHaveAttribute('aria-label', `Pinyin for ${zh}`)
      await expect(w.locator('.hl__wz')).toHaveAttribute('aria-hidden', 'true')
    }
  }
  for (const id of ['A-front', 'B-front', 'C-front']) {
    const c = card(page, id)
    await expect(c.locator('rt'), id).toHaveCount(0)
    await expect(c.locator('ruby'), id).toHaveCount(0)
    for (const key of Object.keys(GUAN_WORDS)) {
      const row = c.locator(`[data-fact="${key}"]`)
      await check(row, GUAN_WORDS[key], `${id} ${key}`)
      await expect(row.locator('.hl__en'), `${id} ${key}`).toHaveCount(1)
      await expect(row.locator('.hl__zh')).toHaveAttribute('lang', 'zh-Hans')
      await expect(row.locator('.hl__wz')).toHaveText(GUAN_WORDS[key].map((w) => w[0]))
    }
    const sr = await c.locator('[data-fact="star"] .sr-only[lang="zh-Hans"]').textContent()
    expect(sr).toBe('天勇星')
    // The pop-up: navy, paper text, the UI font at about 11px, a tail, and out of the flow.
    const st = await c.locator('[data-fact="star"] .hl__tip').first().evaluate((el) => {
      const cs = getComputedStyle(el), tail = getComputedStyle(el, '::after')
      return { bg: cs.backgroundColor, color: cs.color, size: cs.fontSize, family: cs.fontFamily, pos: cs.position, shadow: cs.boxShadow, tail: tail.borderTopWidth, tailColor: tail.borderTopColor }
    })
    expect(st.bg).toBe('rgb(27, 33, 64)')
    expect(st.color).toBe('rgb(250, 245, 234)')
    expect(st.size).toBe('11px')
    expect(st.family).toMatch(/Instrument Sans/)
    expect(st.pos).toBe('absolute')
    expect(st.shadow).not.toBe('none')
    expect(st.tail).toBe('4px')
    expect(st.tailColor).toBe('rgb(27, 33, 64)')
    // Natural character spacing, no gaps between words: the whole Chinese line is as wide as its characters.
    const fs = await c.locator('[data-fact="weapon"] .hl__zh').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const wb = await c.locator('[data-fact="weapon"] .hl__w').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(wb[1].left - (wb[0].left + wb[0].width), id).toBeLessThanOrEqual(0.5)
    expect(wb[1].left + wb[1].width - wb[0].left, id).toBeLessThan(5 * fs * 1.15)
    // The English sits on the same line as the Chinese unless it must wrap (star, background).
    const star = await c.locator('[data-fact="star"] .hl__zh').boundingBox()
    const starEn = await c.locator('[data-fact="star"] .hl__en').boundingBox()
    if (id !== 'C-front') expect(Math.abs(starEn.y + starEn.height / 2 - (star.y + star.height / 2)), id).toBeLessThan(6)
  }
  // Hu Sanniang: 2, 2 and 4 words.
  const hu = card(page, 'A-earthly')
  for (const key of Object.keys(HU_WORDS)) await check(hu.locator(`[data-fact="${key}"]`), HU_WORDS[key], `hu ${key}`)
  // The quote: one word per pop-up, punctuation is plain text between the buttons.
  const q = card(page, 'B-back').locator('blockquote')
  await check(q, QUOTE_WORDS, 'quote')
  await expect(q.locator('.hl__zh')).toContainText('，')
  expect((await q.locator('.hl__btn').allTextContents()).join('')).not.toContain('，')
  expect(await q.locator('.hl__zh').evaluate((el) => [...el.children].map((n) => (n.classList.contains('hl__w') ? n.querySelector('.hl__wz') : n).textContent).join(''))).toBe(QUOTE_CN)
  expect(warnings).toEqual([])
})

test('the label sits beside the first line of the Chinese, with no gap above it', async ({ page }) => {
  await open(page)
  for (const id of ['A-front', 'B-front']) {
    for (const key of ['star', 'weapon', 'background']) {
      const row = card(page, id).locator(`[data-fact="${key}"]`)
      const dt = await row.locator('dt').boundingBox()
      const zh = await row.locator('.hl__zh').boundingBox()
      expect(Math.abs((dt.y + dt.height / 2) - (zh.y + zh.height / 2)), `${id} ${key}`).toBeLessThan(5)
    }
  }
})

test('guided cn: English glosses and the curly-quoted subline are still there; labels, story and credit are Chinese', async ({ page }) => {
  await open(page, 'cn')
  const c = card(page, 'B-front')
  await expect(c.locator('.pinyin')).toHaveText('“Great Blade” Guān Shèng')
  await expect(c.locator('dl.facts dt')).toHaveText(['星宿', '兵器', '出身'])
  await expect(c.locator('dl.facts')).toContainText('the Brave Star')
  await expect(c.locator('dl.facts')).toContainText('Patrol officer of Pudong')
  await expect(c.locator('[data-fact="star"] .hl__tip')).toHaveText(['tiānyǒng', 'xīng'])
  const b = card(page, 'B-back')
  await expect(b.locator('.story')).toContainText(STORY_CN)
  await expect(b.locator('blockquote .hl__en')).toHaveText(QUOTE_EN)
  await expect(b.locator('figcaption')).toHaveText('宣赞荐关胜')
  await expect(b.locator('.viewer__credit')).toContainText('歌川国芳')
})

test('tier emblems: cloud ring for Heavenly Spirits, peaks for Earthly Fiends, rank beside the icon', async ({ page }) => {
  await open(page)
  const info = (id) => card(page, id).locator('[data-tier]').first().evaluate((el) => {
    const svg = el.querySelector('svg').getBoundingClientRect()
    const num = el.querySelector('.tier-symbol__rank')
    const nb = num.getBoundingClientRect()
    const cs = getComputedStyle(num)
    return {
      tier: el.dataset.tier, icon: el.dataset.icon, w: svg.width, h: svg.height,
      hidden: el.getAttribute('aria-hidden'), text: num.textContent.trim(),
      beside: nb.left >= svg.right, font: cs.fontFamily, tabular: cs.fontVariantNumeric,
      svgText: el.querySelectorAll('svg text').length
    }
  })
  for (const id of ['A-front', 'B-front', 'C-front', 'A-front-imm', 'B-front-imm', 'C-front-imm', 'A-locked', 'B-locked', 'C-locked', 'B-stress']) {
    const st = await info(id)
    expect(st.tier, id).toBe('heavenly')
    expect(st.icon, id).toBe('cloud-ring')
    expect(st.text, id).toMatch(/^(5|6)$/)
    expect(st.hidden, id).toBe('true')
    expect(st.beside, id).toBe(true)
    expect(st.svgText, id).toBe(0)
    expect(st.font, id).toContain('Instrument Sans')
    expect(st.tabular, id).toContain('tabular-nums')
  }
  for (const id of ['A-earthly', 'C-earthly']) {
    const st = await info(id)
    expect(st.tier, id).toBe('earthly')
    expect(st.icon, id).toBe('peaks')
    expect(st.text, id).toBe('59')
  }
  // Sizes: 1.5rem icon, and 1.125rem in compact.
  expect((await info('A-front')).w).toBe(24)
  expect((await info('B-front')).h).toBe(24)
  expect((await info('C-front')).w).toBe(18)
})

test('tier emblem gradient ids are unique across the page', async ({ page }) => {
  await open(page)
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-tier] svg [id]')].map((el) => el.id))
  const n = await page.locator('[data-tier] svg').count()
  expect(n).toBeGreaterThan(10)
  expect(ids.length).toBe(n)
  const all = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((el) => el.id))
  expect(new Set(all).size).toBe(all.length)
  const ok = await page.evaluate(() => [...document.querySelectorAll('[data-tier] svg')].every((svg) => {
    const m = /url\(#(.+)\)/.exec(svg.querySelector('path').getAttribute('fill'))
    return m && svg.querySelector(`linearGradient[id="${m[1]}"]`)
  }))
  expect(ok).toBe(true)
})

test('the print viewer credits the tier symbols, with links, and in Chinese when immersive', async ({ page }) => {
  await open(page)
  await card(page, 'B-back').getByRole('button', { name: 'View full print' }).click()
  const dlg = page.getByRole('dialog')
  const line = dlg.locator('.viewer__credit-icons')
  await expect(line).toHaveText('Tier symbols: Lorc, game-icons.net (CC BY 3.0)')
  const site = line.getByRole('link', { name: 'game-icons.net' })
  const lic = line.getByRole('link', { name: 'CC BY 3.0' })
  await expect(site).toHaveAttribute('href', 'https://game-icons.net')
  await expect(site).toHaveAttribute('target', '_blank')
  await expect(site).toHaveAttribute('rel', /noopener/)
  await expect(lic).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/3.0/')
  await expect(lic).toHaveAttribute('target', '_blank')
  await expect(lic).toHaveAttribute('rel', /noopener/)
  // Second, smaller line under the print credit.
  const sizes = await dlg.evaluate((el) => [...el.querySelectorAll('.viewer__credit, .viewer__credit-icons')].map((p) => parseFloat(getComputedStyle(p).fontSize)))
  expect(sizes[1]).toBeLessThan(sizes[0])
  await page.keyboard.press('Escape')
  await open(page, 'en')
  await card(page, 'B-back-imm').getByRole('button', { name: 'View full print' }).click()
  await expect(page.getByRole('dialog').locator('.viewer__credit-icons')).toHaveText('等级图标：Lorc，game-icons.net（CC BY 3.0）')
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
  for (const id of ['A-front', 'A-front-imm', 'A-earthly', 'B-front', 'B-front-imm', 'B-stress', 'C-front', 'C-front-imm', 'C-earthly']) {
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
    const feetRow = id.includes('earthly') ? 60 : 58
    const feetY = sp.y + (feetRow + 0.5) * k
    expect(Math.abs(sb.y + sb.height / 2 - feetY), id).toBeLessThanOrEqual(1.5)
  }
  for (const id of ['A-locked', 'B-locked', 'C-locked']) await expect(card(page, id).locator('.shade'), id).toHaveCount(0)
})

test('the back has no sprite shadow', async ({ page }) => {
  await open(page)
  await expect(card(page, 'B-back').locator('.shade')).toHaveCount(0)
  await expect(card(page, 'B-back-imm').locator('.shade')).toHaveCount(0)
})

// Proportions and fit --------------------------------------------------------

const FACE_IDS = ['B-flip', 'B-front', 'B-back', 'B-front-imm', 'B-back-imm', 'B-locked', 'B-stress', 'A-front', 'A-front-imm', 'A-locked', 'A-earthly', 'A-stress']

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
          // The full-art sprite's 320px box may reach past the face (it is clipped; what is drawn is checked in its own test).
          if (face.scrollHeight > face.clientHeight + 1 || (!face.querySelector('.figure') && face.scrollWidth > face.clientWidth + 1)) out.push(`${id} ${face.className} scrolls ${face.scrollWidth}x${face.scrollHeight} vs ${face.clientWidth}x${face.clientHeight}`)
        }
      }
      return out
    }, ALL_IDS)
    expect(bad).toEqual([])
  })
}

test('the print band on the back keeps at least 4.5rem, in both modes and locales', async ({ page }) => {
  await open(page)
  for (const lang of ['en', 'cn']) {
    await page.goto(`/hero-card?lang=${lang}`)
    for (const id of ['B-back', 'B-back-imm']) {
      const h = await card(page, id).locator('.backprint').boundingBox()
      expect(h.height, `${lang} ${id}`).toBeGreaterThanOrEqual(72)
    }
  }
})

test('nickname and name are one title: same size, colour and font', async ({ page }) => {
  await open(page)
  for (const id of ['A-front', 'A-stress', 'B-front', 'B-stress', 'B-back', 'C-front', 'C-stress', 'A-front-imm', 'B-front-imm', 'B-back-imm', 'C-front-imm']) {
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
  expect(await guan.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('1280px 256px')
  const hu = card(page, 'A-earthly').locator('.sprite')
  expect(await hu.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toContain('steps(4')
  expect(await hu.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('1024px 256px')
  const big = card(page, 'B-front').locator('.sprite')
  expect(await big.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('1600px 320px')
})

test('a hero with no quote shows no quote block', async ({ page }) => {
  await open(page)
  const hu = card(page, 'A-earthly')
  await expect(hu.getByRole('heading', { name: '扈三娘' })).toBeVisible()
  await expect(hu.locator('figure')).toHaveCount(0)
  await expect(hu).toContainText('地煞')
  await expect(hu.getByRole('button', { name: 'Flip card' })).toHaveCount(0)
})

// Back and flip -------------------------------------------------------------

test('the back shows the print at full strength, the name line and the story, and no credit', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-back')
  await expect(c.locator('.face--front')).toHaveCount(0)
  await expect(c.locator('.sprite')).toHaveCount(0)
  await expect(c.locator('.story')).toHaveText(new RegExp('^' + STORY_EN))
  // Huyan Zhuo feigned surrender; Song Jiang did not trick him.
  await expect(c.locator('.story')).not.toContainText('Song Jiang lured')
  // The credit lives in the print viewer, not on the back face.
  await expect(c.locator('.credit')).toHaveCount(0)
  await expect(c.locator('.plate--back')).not.toContainText('Kuniyoshi')
  expect(await visibleText(c.locator('.face--back > :not(dialog)').first())).not.toContain('Kuniyoshi')
  await expect(c.locator('.viewer__credit')).toHaveText(CREDIT_EN)
  await expect(c.locator('.viewer__credit')).toBeHidden()
  await expect(c.getByRole('heading', { name: '关胜' })).toBeVisible()
  expect(await c.locator('.nick__zh').textContent()).toBe('大刀')
  await expect(c.locator('.pinyin')).toHaveText('“Great Blade” Guān Shèng')
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
  await expect(c.locator('.viewer__credit')).toContainText('歌川国芳')
  await expect(c).not.toContainText('Huyan Zhuo pretended')
  await expect(c.locator('.story')).toContainText('呼延灼诈降')
  await expect(c.locator('.story')).not.toContainText('宋江设计')
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
    await expect(card(page, id).getByRole('button', { name: 'Flip card' }), id).toHaveCount(0)
    await expect(card(page, id).locator('.expandbtn'), id).toHaveCount(0)
  }
  await expect(lab(page, 'B-flip').getByRole('button', { name: 'Flip card' })).toHaveCount(1)
})

// Pinyin on demand -------------------------------------------------------------

const tipVis = (row) => row.locator('.hl__tip').first().evaluate((el) => getComputedStyle(el).visibility)
// Where things are, relative to the face so that scrolling the page does not count as movement.
const layoutOf = (c) => c.evaluate((el) => {
  const f = el.querySelector('.face').getBoundingClientRect()
  const out = {}
  for (const e of el.querySelectorAll('.face *')) {
    if (e.classList.contains('hl__tip')) continue
    const r = e.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue // not rendered (the closed dialog)
    out[`${e.tagName}#${out.n = (out.n || 0) + 1}`] = [r.x - f.x, r.y - f.y, r.width, r.height].map((n) => Math.round(n * 100) / 100)
  }
  return out
})
// The bubble must lie inside the inside of the face's border.
const tipInside = (c, row) => c.evaluate((el, key) => {
  const face = el.querySelector('.face:not([aria-hidden="true"])').getBoundingClientRect()
  const bw = parseFloat(getComputedStyle(el.querySelector('.face')).borderLeftWidth)
  const t = el.querySelector(key).getBoundingClientRect()
  return t.left >= face.left + bw - 0.5 && t.right <= face.right - bw + 0.5 && t.top >= face.top + bw - 0.5 && t.bottom <= face.bottom - bw + 0.5
}, row)

const word = (c, key, i) => c.locator(`[data-fact="${key}"] .hl__w`).nth(i)

for (const L of LAYOUTS) {
  test(`${L}: a word's pinyin is hidden by default, a click shows just that word's, a second click hides it, and nothing moves`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-front`)
    const row = c.locator('[data-fact="weapon"]')
    const w = word(c, 'weapon', 1)
    const btn = row.getByRole('button', { name: 'Pinyin for 偃月刀' })
    await expect(btn).toHaveCount(1)
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await expect(btn).not.toHaveAttribute('aria-describedby', /.+/)
    // Its look: text, not a button.
    const look = await btn.evaluate((el) => { const cs = getComputedStyle(el); return { border: cs.borderTopWidth, bg: cs.backgroundColor, family: cs.fontFamily, parent: getComputedStyle(el.parentElement).fontFamily, margin: cs.margin, display: cs.display } })
    expect(look.border).toBe('0px')
    expect(look.bg).toBe('rgba(0, 0, 0, 0)')
    expect(look.family).toBe(look.parent)
    expect(look.margin).toBe('0px')
    expect(await tipVis(w)).toBe('hidden')
    // The dotted underline marks it while hidden.
    const ul = () => w.locator('.hl__wz').evaluate((el) => { const cs = getComputedStyle(el); return `${cs.textDecorationLine} ${cs.textDecorationStyle} ${cs.textDecorationColor}` })
    expect(await ul()).toBe('underline dotted rgb(95, 98, 118)')
    await page.mouse.move(0, 0)
    const before = await layoutOf(c)

    await btn.click()
    await page.mouse.move(0, 0)
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(await tipVis(w)).toBe('visible')
    await expect(w.locator('.hl__tip')).toHaveText('yǎnyuèdāo')
    const id = await w.locator('.hl__tip').getAttribute('id')
    expect(id).toBeTruthy()
    await expect(btn).toHaveAttribute('aria-describedby', id)
    expect(await ul()).toBe('underline solid rgb(200, 50, 30)')
    expect(await layoutOf(c)).toEqual(before)
    expect(await tipInside(c, `[data-fact="weapon"] .hl__w:nth-child(2) .hl__tip`)).toBe(true)
    // Left-aligned with its word, just above it.
    const tb = await w.locator('.hl__tip').boundingBox()
    const lb = await btn.boundingBox()
    expect(Math.abs(tb.x - lb.x)).toBeLessThanOrEqual(1)
    expect(tb.y + tb.height).toBeLessThanOrEqual(lb.y + 1)
    // Only that word: the other words' pinyin is still hidden.
    expect(await tipVis(word(c, 'weapon', 0))).toBe('hidden')
    expect(await tipVis(word(c, 'star', 0))).toBe('hidden')

    await btn.click()
    await page.mouse.move(0, 0)
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await expect(btn).not.toHaveAttribute('aria-describedby', /.+/)
    expect(await tipVis(w)).toBe('hidden')
    expect(await layoutOf(c)).toEqual(before)
  })

  test(`${L}: Tab reaches each word, Enter and Space toggle it, Escape and an outside click close it, focus is visible`, async ({ page }) => {
    await open(page)
    const c = card(page, `${L}-front`)
    const w = word(c, 'weapon', 0)
    const btn = w.getByRole('button')
    await btn.focus()
    await page.keyboard.press('Enter')
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(await tipVis(w)).toBe('visible')
    await page.keyboard.press('Space')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(await tipVis(w)).toBe('hidden')
    await page.keyboard.press('Enter')
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(await tipVis(w)).toBe('hidden')
    // Outside click.
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await page.mouse.click(2, 2)
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    // Tab order: every word in reading order, star then weapon then background.
    const all = c.locator('.hl__btn')
    await all.first().focus()
    for (let i = 1; i < 6; i++) {
      await page.keyboard.press('Tab')
      await expect(all.nth(i)).toBeFocused()
    }
    const outline = await all.nth(5).evaluate((el) => getComputedStyle(el).outlineStyle + ' ' + getComputedStyle(el).outlineWidth)
    expect(outline).toBe('solid 2px')
  })
}

test('only one pop-up is open per card, and flipping closes it', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-front')
  const star = c.locator('[data-fact="star"] button').first()
  const weapon = c.locator('[data-fact="weapon"] button').nth(1)
  await star.click()
  await page.mouse.move(0, 0)
  await weapon.click()
  await page.mouse.move(0, 0)
  await expect(star).toHaveAttribute('aria-pressed', 'false')
  await expect(weapon).toHaveAttribute('aria-pressed', 'true')
  expect(await c.locator('.hl__tip').evaluateAll((els) => els.filter((e) => getComputedStyle(e).visibility === 'visible').length)).toBe(1)
  // Another word of the same line closes the first.
  const sibling = c.locator('[data-fact="weapon"] button').first()
  await sibling.click()
  await page.mouse.move(0, 0)
  await expect(weapon).toHaveAttribute('aria-pressed', 'false')
  await expect(sibling).toHaveAttribute('aria-pressed', 'true')
  // Another card is independent.
  const other = card(page, 'A-front').locator('[data-fact="star"] button').first()
  await other.click()
  await expect(other).toHaveAttribute('aria-pressed', 'true')
  await expect(sibling).toHaveAttribute('aria-pressed', 'false')

  // Flipping closes an open pop-up.
  const fl = card(page, 'B-flip')
  const line = fl.locator('.face--front [data-fact="star"] button').first()
  await line.click()
  await expect(line).toHaveAttribute('aria-pressed', 'true')
  await fl.getByRole('button', { name: 'Flip card' }).click()
  await expect(line).toHaveAttribute('aria-pressed', 'false')
  await fl.getByRole('button', { name: 'Flip card' }).click()
  await expect(line).toHaveAttribute('aria-pressed', 'false')
})

test('every word pop-up stays inside the face, on every guided lab card, in en and cn, and moves nothing', async ({ page }) => {
  for (const lang of ['en', 'cn']) {
    await open(page, lang)
    for (const id of ['A-front', 'A-earthly', 'A-stress', 'B-front', 'B-stress', 'B-back', 'C-front', 'C-earthly']) {
      const c = card(page, id)
      const n = await c.locator('.hl__btn').count()
      expect(n, id).toBeGreaterThan(0)
      const before = await layoutOf(c)
      for (let i = 0; i < n; i++) {
        const b = c.locator('.hl__btn').nth(i)
        await b.click()
        await page.mouse.move(0, 0)
        await expect(b).toHaveAttribute('aria-pressed', 'true')
        const t = await b.locator('xpath=following-sibling::*[contains(@class,"hl__tip")]').boundingBox()
        const face = await c.locator('.face').boundingBox()
        expect(t.x, `${lang} ${id} ${i}`).toBeGreaterThanOrEqual(face.x)
        expect(t.y, `${lang} ${id} ${i}`).toBeGreaterThanOrEqual(face.y)
        expect(t.x + t.width, `${lang} ${id} ${i}`).toBeLessThanOrEqual(face.x + face.width)
        expect(t.y + t.height, `${lang} ${id} ${i}`).toBeLessThanOrEqual(face.y + face.height)
        expect(await layoutOf(c), `${lang} ${id} ${i}`).toEqual(before)
        await page.keyboard.press('Escape')
      }
    }
  }
})

test('the pop-up of the last word of the quote (end of a line) stays inside the face and moves nothing', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-back')
  const last = c.locator('.hl__btn').last()
  const before = await layoutOf(c)
  await last.click()
  const face = await c.locator('.face').boundingBox()
  const tb = await last.locator('xpath=following-sibling::*[contains(@class,"hl__tip")]').boundingBox()
  expect(tb.x + tb.width).toBeLessThanOrEqual(face.x + face.width - 2)
  expect(await layoutOf(c)).toEqual(before)
})

test('hovering a word shows its pinyin on pointer devices', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'hover needs a pointer')
  await open(page)
  const c = card(page, 'B-front')
  const w = word(c, 'weapon', 0)
  const before = await layoutOf(c)
  expect(await tipVis(w)).toBe('hidden')
  await w.getByRole('button').hover()
  expect(await tipVis(w)).toBe('visible')
  await expect(w.locator('.hl__tip')).toHaveText('qīnglóng')
  // Only the hovered word: its neighbour stays hidden.
  expect(await tipVis(word(c, 'weapon', 1))).toBe('hidden')
  expect(await layoutOf(c)).toEqual(before)
  // Hover does not press it.
  await expect(w.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  await page.mouse.move(0, 0)
  expect(await tipVis(w)).toBe('hidden')
})

test('the word buttons read in Chinese in the cn locale, and the quote on the back has them too', async ({ page }) => {
  await open(page, 'cn')
  await expect(card(page, 'B-front').getByRole('button', { name: '天勇的拼音' })).toHaveCount(1)
  await expect(card(page, 'B-back').locator('blockquote').getByRole('button', { name: '兵书的拼音' })).toHaveCount(1)
  await expect(card(page, 'B-back').locator('blockquote').getByRole('button')).toHaveCount(QUOTE_WORDS.length)
})

test('immersive and locked cards have no pinyin buttons', async ({ page }) => {
  await open(page)
  for (const id of ['A-front-imm', 'B-front-imm', 'C-front-imm', 'A-locked', 'B-locked', 'B-back-imm']) {
    await expect(card(page, id).locator('.hl__btn'), id).toHaveCount(0)
  }
})

test('the hidden face of a flippable card has inert pinyin buttons', async ({ page }) => {
  await open(page)
  const fl = card(page, 'B-flip')
  expect(await fl.locator('.face--back').evaluate((el) => el.inert)).toBe(true)
  await expect(fl.locator('.face--back .hl__btn')).toHaveCount(QUOTE_WORDS.length)
  await expect(fl.getByRole('button', { name: /^Pinyin for / })).toHaveCount(6)
})

// Same text-box height in every state ----------------------------------------------

test('full art: the fact plate is the same height in guided, immersive and locked, and the sprite does not move', async ({ page }) => {
  await open(page)
  const m = (id) => card(page, id).evaluate((el) => {
    const r = (sel) => el.querySelector(sel).getBoundingClientRect()
    const face = el.querySelector('.face').getBoundingClientRect()
    return { plate: r('.plate--info').height, plateTop: r('.plate--info').top - face.top, spriteTop: r('.sprite').top - face.top, figure: r('.figure').height, name: r('.plate--name').height }
  })
  const g = await m('B-front')
  // A compact plate: about 110px (it was 163), and the figure takes the freed height.
  expect(g.plate).toBeLessThanOrEqual(115)
  expect(g.plate).toBeGreaterThanOrEqual(100)
  expect(g.figure).toBe(ART_H.B)
  for (const id of ['B-front-imm', 'B-locked', 'B-stress']) {
    const o = await m(id)
    expect(Math.abs(o.plate - g.plate), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.plateTop - g.plateTop), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.spriteTop - g.spriteTop), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.figure - g.figure), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.name - g.name), id).toBeLessThanOrEqual(0.5)
  }
  await expect(card(page, 'B-locked').locator('.plate--info')).toContainText('Not yet collected')
})

test('framed: the fact panel is the same height in guided, immersive and locked, and the art window does not move', async ({ page }) => {
  await open(page)
  const m = (id) => card(page, id).evaluate((el) => {
    const r = (sel) => el.querySelector(sel).getBoundingClientRect()
    const face = el.querySelector('.face').getBoundingClientRect()
    return { panel: r('.panel').height, panelTop: r('.panel').top - face.top, window: r('.window').height, windowTop: r('.window').top - face.top, spriteTop: r('.sprite').top - face.top }
  })
  const g = await m('A-front')
  // The panel was 168px; the window takes the freed height.
  expect(g.panel).toBeLessThanOrEqual(112)
  expect(g.window).toBe(ART_H.A)
  for (const id of ['A-front-imm', 'A-locked', 'A-earthly', 'A-stress']) {
    const o = await m(id)
    expect(Math.abs(o.panel - g.panel), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.panelTop - g.panelTop), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.window - g.window), id).toBeLessThanOrEqual(0.5)
    expect(Math.abs(o.windowTop - g.windowTop), id).toBeLessThanOrEqual(0.5)
    if (id !== 'A-earthly') expect(Math.abs(o.spriteTop - g.spriteTop), id).toBeLessThanOrEqual(0.5)
  }
  await expect(card(page, 'A-locked').locator('.panel')).toContainText('Not yet collected')
})

test('framed: the 4x sprite fits the window, drawn part, feet and shadow inside it', async ({ page }) => {
  await open(page)
  for (const id of ['A-front', 'A-front-imm', 'A-stress', 'A-locked']) {
    const c = card(page, id)
    const win = await c.locator('.window').boundingBox()
    const sp = await c.locator('.sprite').boundingBox()
    const inner = { top: win.y + 4, bottom: win.y + win.height - 4, left: win.x + 4, right: win.x + win.width - 4 }
    // Drawn rows start below the top of the window and end at the bottom of the frame.
    expect(sp.y + GUAN.top * 4, id).toBeGreaterThanOrEqual(inner.top)
    expect(sp.y + sp.height, id).toBeLessThanOrEqual(inner.bottom + 0.5)
    expect(sp.x + GUAN.left * 4, id).toBeGreaterThanOrEqual(inner.left)
    expect(sp.x + (GUAN.right + 1) * 4, id).toBeLessThanOrEqual(inner.right)
    if (id !== 'A-locked') {
      const sh = await c.locator('.shade').boundingBox()
      expect(sh.y + sh.height, id).toBeLessThanOrEqual(inner.bottom)
      expect(sp.y + 59 * 4, id).toBeLessThanOrEqual(inner.bottom)
    }
  }
})

for (const lang of ['en', 'cn']) {
  test(`${lang}: the guided facts fit inside the plate or panel, and the sprite's feet and shadow are inside the art`, async ({ page }) => {
    await open(page, lang)
    const bad = await page.evaluate((ids) => {
      const out = []
      for (const id of ids) {
        const c = document.querySelector(`[data-lab-id="${id}"] article`)
        const plate = c.querySelector('.plate--info, .panel').getBoundingClientRect()
        const dl = c.querySelector('dl').getBoundingClientRect()
        const cs = getComputedStyle(c.querySelector('.plate--info, .panel'))
        const top = plate.top + parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop)
        const bottom = plate.bottom - parseFloat(cs.borderBottomWidth) - parseFloat(cs.paddingBottom)
        if (dl.top < top - 0.5 || dl.bottom > bottom + 0.5) out.push(`${id} facts ${dl.top.toFixed(1)}-${dl.bottom.toFixed(1)} vs ${top.toFixed(1)}-${bottom.toFixed(1)}`)
        const art = c.querySelector('.figure, .window').getBoundingClientRect()
        const sh = c.querySelector('.shade').getBoundingClientRect()
        if (sh.bottom > art.bottom + 0.5 || sh.top < art.top) out.push(`${id} shadow ${sh.top.toFixed(1)}-${sh.bottom.toFixed(1)} vs ${art.top.toFixed(1)}-${art.bottom.toFixed(1)}`)
        // Every row of the facts sits inside the plate's own box, nothing scrolls.
        const p = c.querySelector('.plate--info, .panel')
        if (p.scrollHeight > p.clientHeight + 1) out.push(`${id} plate scrolls`)
      }
      return out
    }, ['B-front', 'B-stress', 'A-front', 'A-earthly', 'A-stress'])
    expect(bad).toEqual([])
  })
}

// The print viewer --------------------------------------------------------------

test('the back has an expand button in the print band, bottom-right, 2rem', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-back')
  const btn = c.getByRole('button', { name: 'View full print' })
  await expect(btn).toHaveCount(1)
  const b = await btn.boundingBox()
  const band = await c.locator('.backprint').boundingBox()
  expect(Math.abs(b.width - 32)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(b.height - 32)).toBeLessThanOrEqual(0.5)
  expect(b.x + b.width).toBeLessThanOrEqual(band.x + band.width)
  expect(band.x + band.width - (b.x + b.width)).toBeLessThan(16)
  expect(band.y + band.height - (b.y + b.height)).toBeLessThan(16)
  expect(b.x).toBeGreaterThan(band.x + band.width / 2)
  expect(await btn.evaluate((el) => getComputedStyle(el).boxShadow)).toMatch(/2px 2px 0px/)
  await expect(btn.locator('svg')).toHaveCount(1)
  // The band is still tall: it gained the credit's space.
  expect(band.height).toBeGreaterThanOrEqual(72)
})

test('the print band is taller without the credit', async ({ page }) => {
  await open(page)
  const band = await card(page, 'B-back').locator('.backprint').boundingBox()
  expect(band.height).toBeGreaterThan(110)
})

test('the expand button opens a modal dialog with the whole print and the credit; Escape, the close button and the backdrop close it', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-back')
  const btn = c.getByRole('button', { name: 'View full print' })
  const dlg = page.getByRole('dialog')
  await expect(dlg).toHaveCount(0)

  await btn.click()
  await expect(dlg).toBeVisible()
  expect(await dlg.evaluate((el) => el.matches(':modal'))).toBe(true)
  await expect(dlg.locator('img')).toBeVisible()
  expect(await dlg.locator('img').evaluate((el) => getComputedStyle(el).objectFit)).toBe('contain')
  await expect(dlg.locator('.viewer__credit')).toHaveText(CREDIT_EN)
  expect(await dlg.evaluate((el) => getComputedStyle(el, '::backdrop').backgroundColor)).toBe('rgba(27, 33, 64, 0.72)')
  // As large as the viewport allows, with a margin.
  const vp = page.viewportSize()
  const d = await dlg.boundingBox()
  expect(d.width).toBeGreaterThan(vp.width * 0.8)
  expect(d.width).toBeLessThanOrEqual(vp.width * 0.95)
  expect(d.height).toBeGreaterThan(vp.height * 0.7)
  expect(d.height).toBeLessThanOrEqual(vp.height * 0.95)
  expect(d.x).toBeGreaterThan(0)
  expect(d.y).toBeGreaterThanOrEqual(0)
  // The credit sits beneath the print, and the close button is inside the dialog.
  const im = await dlg.locator('img').boundingBox()
  const cr = await dlg.locator('.viewer__credit').boundingBox()
  expect(cr.y).toBeGreaterThanOrEqual(im.y + im.height - 1)
  await expect(dlg.getByRole('button', { name: 'Close' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dlg).toHaveCount(0)
  await expect(btn).toBeFocused()

  await btn.click()
  await expect(dlg).toBeVisible()
  await dlg.getByRole('button', { name: 'Close' }).click()
  await expect(dlg).toHaveCount(0)
  await expect(btn).toBeFocused()

  await btn.click()
  await expect(dlg).toBeVisible()
  await page.mouse.click(3, 3)
  await expect(dlg).toHaveCount(0)
  await expect(btn).toBeFocused()

  // Clicking inside the dialog does not close it.
  await btn.click()
  await dlg.locator('img').click()
  await expect(dlg).toBeVisible()
})

test('the viewer reads in Chinese in the cn locale, and in immersive mode shows the credit in Chinese', async ({ page }) => {
  await open(page, 'cn')
  const c = card(page, 'B-back')
  await c.getByRole('button', { name: '查看全图' }).click()
  const dlg = page.getByRole('dialog')
  await expect(dlg.locator('.viewer__credit')).toContainText('歌川国芳')
  await expect(dlg.getByRole('button', { name: '关闭' })).toBeVisible()
  await page.keyboard.press('Escape')
  await open(page, 'en')
  await card(page, 'B-back-imm').getByRole('button', { name: 'View full print' }).click()
  await expect(page.getByRole('dialog').locator('.viewer__credit')).toContainText('歌川国芳')
  await expect(page.getByRole('dialog').locator('.viewer__credit')).not.toContainText('Kuniyoshi')
})

test('opening the viewer does not flip the card, and locked cards have no expand button', async ({ page }) => {
  await open(page)
  const c = card(page, 'B-flip')
  const flip = c.getByRole('button', { name: 'Flip card' })
  await flip.click()
  await expect(flip).toHaveAttribute('aria-pressed', 'true')
  await page.waitForTimeout(700)
  await c.getByRole('button', { name: 'View full print' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(flip).toHaveAttribute('aria-pressed', 'true')
  await expect(c.getByRole('status')).toHaveText('Showing the back of the card')
  // The front face's expand button (the hidden back's, before flipping) is not reachable.
  for (const L of LAYOUTS) await expect(card(page, `${L}-locked`).locator('.expandbtn'), L).toHaveCount(0)
  await expect(card(page, 'B-locked').locator('dialog')).toHaveCount(0)
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
