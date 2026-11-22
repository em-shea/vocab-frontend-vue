// Renders the app icons (public/icons). Run: node scripts/build-icons.mjs
// Uses the installed Chrome via Playwright.
//
// Draws them from the nav's 好 mark: white brush 好 on vermilion.
// Staging gets its own set (public/icons/staging/) on navy, so the two
// installed apps can be told apart on a phone. vite.config.js picks the set
// by build mode.
//
// The 好 is sized by its ink, not its font box: the brush glyph leaves a lot
// of empty space inside its em square, which made it look small next to
// other apps' icons. `ink` is the share of the icon's width or height that
// the drawn character fills (whichever is larger), centred on the ink.
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { readFileSync, mkdirSync } from 'node:fs'
const here = (p) => fileURLToPath(new URL(p, import.meta.url))
// Inlined: a page made with setContent may not load fonts from file:// URLs.
const font = 'data:font/woff2;base64,' + readFileSync(here('../src/assets/fonts/MaShanZheng-400.woff2')).toString('base64')

const variants = [
  { dir: here('../public/icons'), background: '#C8321E' }, // vermilion: prod
  { dir: here('../public/icons/staging'), background: '#1B2140' } // navy: staging
]
const icons = [
  ['icon-192.png', 192, 0.78],
  ['icon-512.png', 512, 0.78],
  // Android crops maskable icons to a circle or squircle; the safe zone is a
  // circle 80% of the width. 0.74 keeps the brush strokes inside it.
  ['icon-maskable-512.png', 512, 0.74],
  ['apple-touch-icon.png', 180, 0.72],
  ['favicon-32.png', 32, 0.94]
]

const html = (size, background) => `<!doctype html><html><head><style>
@font-face { font-family: Brush; src: url('${font}') format('woff2'); }
html,body{margin:0;width:${size}px;height:${size}px;background:${background};overflow:hidden}
canvas{display:block}
</style></head><body><canvas width="${size}" height="${size}"></canvas></body></html>`

// Measures the glyph's ink at a reference size, then draws it scaled so the
// ink fills `ink` of the icon, centred.
function draw ({ size, ink }) {
  const ref = 1000
  const m = document.createElement('canvas')
  m.width = m.height = ref * 2
  const mc = m.getContext('2d')
  mc.font = `${ref}px Brush`
  mc.textBaseline = 'alphabetic'
  mc.fillStyle = '#000'
  mc.fillText('好', ref / 2, ref * 1.5)
  const data = mc.getImageData(0, 0, m.width, m.height).data
  let x0 = m.width, y0 = m.height, x1 = 0, y1 = 0
  for (let y = 0; y < m.height; y++) {
    for (let x = 0; x < m.width; x++) {
      if (data[(y * m.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x
        if (y < y0) y0 = y; if (y > y1) y1 = y
      }
    }
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1
  const scale = (size * ink) / Math.max(w, h)
  const c = document.querySelector('canvas').getContext('2d')
  c.font = `${ref * scale}px Brush`
  c.textBaseline = 'alphabetic'
  c.fillStyle = '#fff'
  const cx = (x0 + w / 2 - ref / 2) * scale
  const cy = (y0 + h / 2 - ref * 1.5) * scale
  c.fillText('好', size / 2 - cx, size / 2 - cy)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
for (const { dir, background } of variants) {
  mkdirSync(dir, { recursive: true })
  for (const [name, size, ink] of icons) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(html(size, background))
    await page.evaluate(() => document.fonts.load('100px Brush'))
    await page.evaluate(draw, { size, ink })
    await page.screenshot({ path: `${dir}/${name}` })
  }
}
await browser.close()
