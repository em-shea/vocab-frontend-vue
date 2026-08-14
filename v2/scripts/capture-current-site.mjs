#!/usr/bin/env node
/**
 * Capture the current (Vue 2) production site, before the redesign.
 *
 *   node scripts/capture-current-site.mjs [outDir]
 *
 * These are the "before" half of the redesign comparison, so they are committed
 * rather than treated as scratch output — once the cutover happens the current
 * site is gone and cannot be re-shot.
 *
 * Signed-in screens are not captured: sign-in is a one-time code emailed to the
 * user, so it cannot be automated here. Those pages are listed at the bottom of
 * the run output as a manual to-do.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const outDir = process.argv[2] ?? 'design/before'
const BASE = 'https://haohaotiantian.com'

// HSK Level 1, so review and quiz show real words rather than an empty state.
const LIST = '1ebcad3f-5dfd-6bfe-bda4-acde48001122'

const PAGES = [
  ['home', '/'],
  ['review', `/review?list_id=${LIST}&date_range=30&char=simplified`],
  ['quiz', `/quiz?list_id=${LIST}&date_range=30&ques=10&char=simplified`],
  ['signin', '/signin'],
  ['subscribed', '/subscribed'],
  ['unsubscribe', `/unsub?list=${LIST}&char=simplified&email=example%40example.com`]
]

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }]
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()

for (const [label, viewport] of VIEWPORTS) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile: label === 'mobile',
    hasTouch: label === 'mobile'
  })

  for (const [name, path] of PAGES) {
    const page = await context.newPage()
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
      await page.evaluate(() => document.fonts.ready)
      // The app fetches words after mount; give it a beat to paint real content.
      await page.waitForTimeout(1500)

      const file = `${outDir}/${name}-${label}.png`
      await page.screenshot({ path: file, fullPage: true })

      const title = await page.title()
      const h = await page.evaluate(() => document.body.scrollHeight)
      console.log(`${label.padEnd(7)} ${name.padEnd(12)} ${String(h).padStart(5)}px  "${title}"  -> ${file}`)
    } catch (err) {
      console.log(`${label.padEnd(7)} ${name.padEnd(12)} FAILED: ${err.message.split('\n')[0]}`)
    }
    await page.close()
  }
  await context.close()
}

await browser.close()

console.log(`
Not captured - these need a signed-in session (one-time code by email):
  /profile  /profile-settings  /manage-lists  /my-quizzes  /sentences  /verification`)
