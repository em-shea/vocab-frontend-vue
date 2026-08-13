#!/usr/bin/env node
/**
 * Screenshot the running app at the widths the plan verifies against.
 *
 *   npm run dev            # in another shell
 *   node scripts/shoot.mjs [url] [outDir]
 *
 * Phase 4 needs the same thing at scale - driving the ported screens at 390 and
 * 1120 and diffing against the current-state screenshot set - so this exists as
 * a script rather than as ad hoc browser steps.
 *
 * Also fails if the page scrolls horizontally at either width, which is the
 * defect responsive layouts actually ship with.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5173/'
const outDir = process.argv[3] ?? '.screenshots'
const WIDTHS = [
  { name: '390', width: 390, height: 844 },
  { name: '1120', width: 1120, height: 900 }
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
let failed = false

for (const { name, width, height } of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle' })
  // Webfonts must be settled or the shot captures fallback metrics.
  await page.evaluate(() => document.fonts.ready)

  const path = `${outDir}/styleguide-${name}.png`
  await page.screenshot({ path, fullPage: true })

  const { scrollWidth, clientWidth, fontsLoaded } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`)
  }))

  const overflows = scrollWidth > clientWidth
  if (overflows) failed = true
  console.log(
    `${name.padEnd(5)} viewport ${String(clientWidth).padStart(4)}  content ${String(scrollWidth).padStart(4)}  ` +
    `${overflows ? 'HORIZONTAL OVERFLOW' : 'no overflow'}  ->  ${path}`
  )
  console.log(`      fonts loaded: ${[...new Set(fontsLoaded)].join(', ') || 'none'}`)
  await page.close()
}

await browser.close()
process.exit(failed ? 1 : 0)
