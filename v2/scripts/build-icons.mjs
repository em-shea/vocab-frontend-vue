// Renders the app icons (public/icons). Run: node scripts/build-icons.mjs
// Uses the installed Chrome via Playwright.
//
// Draws them from the nav's 好 mark: white brush 好 on vermilion.
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const out = here('../public/icons')
// Inlined: a page made with setContent may not load fonts from file:// URLs.
const font = 'data:font/woff2;base64,' + readFileSync(here('../src/assets/fonts/MaShanZheng-400.woff2')).toString('base64')
const html = (size, inset) => `<!doctype html><html><head><style>
@font-face { font-family: Brush; src: url('${font}') format('woff2'); }
html,body{margin:0;width:${size}px;height:${size}px;background:#C93F1F}
div{width:100%;height:100%;display:grid;place-items:center;font-family:Brush;color:#fff;
font-size:${Math.round(size * (1 - 2 * inset) * 0.86)}px;line-height:1}
span{transform:translateY(${Math.round(size * 0.02)}px)}
</style></head><body><div><span>好</span></div></body></html>`
const icons = [
  ['icon-192.png', 192, 0.08],
  ['icon-512.png', 512, 0.08],
  // Maskable icons get cropped to a circle or squircle: keep the mark in the middle 80%.
  ['icon-maskable-512.png', 512, 0.2],
  ['apple-touch-icon.png', 180, 0.1],
  ['favicon-32.png', 32, 0.02]
]
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
for (const [name, size, inset] of icons) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(html(size, inset))
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${out}/${name}` })
}
await browser.close()
