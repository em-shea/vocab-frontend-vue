#!/usr/bin/env node
/**
 * Build the self-hosted font set and its @font-face CSS.
 *
 *   node scripts/build-fonts.mjs
 *
 * Requires Python with fonttools:  pip install "fonttools[woff]" brotli
 *
 * Families and weights match the design file's own Google Fonts request.
 *
 * Latin faces are taken as Google serves them, keeping its unicode-range split
 * so the latin-ext chunk only downloads when needed.
 *
 * CJK faces are subset locally and split along the tiers in
 * src/assets/cjk-tiers.json, each emitted with its own unicode-range. Before
 * this, each face was a single file covering every character, so a page showing
 * twenty characters pulled 1.37 MB. Now a browser fetches only the chunks whose
 * characters are on the page.
 *
 * Ma Shan Zheng is display-only and stays a single small file — re-run this
 * after adding a Chinese character to brush copy, or it falls back to the serif.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(HERE, '..', 'src', 'assets')
const FONT_DIR = join(ASSETS, 'fonts')
const CACHE = join(HERE, '..', '.font-build')

const UA_MODERN = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36'
// An old UA makes Google serve one TTF per weight instead of ~100 woff2 chunks.
const UA_LEGACY = 'Mozilla/4.0'

const LATIN = [
  ['Archivo', 'Archivo:wght@400;500;600;700;800;900'],
  ['InstrumentSans', 'Instrument+Sans:wght@400;500;600;700'],
  ['InstrumentSerif', 'Instrument+Serif:ital@0;1'],
  ['Outfit', 'Outfit:wght@400;500;600;700;800'],
  ['DMMono', 'DM+Mono:wght@400;500']
]
const CJK = [
  ['NotoSansSC', 'Noto+Sans+SC:wght@400;500;700'],
  ['NotoSerifSC', 'Noto+Serif+SC:wght@400;600;700']
]
const DISPLAY = ['MaShanZheng', 'Ma+Shan+Zheng']

const CSS_FAMILY = {
  Archivo: 'Archivo',
  InstrumentSans: 'Instrument Sans',
  InstrumentSerif: 'Instrument Serif',
  Outfit: 'Outfit',
  DMMono: 'DM Mono',
  NotoSansSC: 'Noto Sans SC',
  NotoSerifSC: 'Noto Serif SC',
  MaShanZheng: 'Ma Shan Zheng'
}

mkdirSync(CACHE, { recursive: true })
mkdirSync(FONT_DIR, { recursive: true })

async function fetchText (url, ua) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } })
  if (!res.ok) throw new Error(`${res.status} for ${url}`)
  return res.text()
}

async function fetchBinary (url, ua) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } })
  if (!res.ok) throw new Error(`${res.status} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Collapse a character list into compact unicode-range syntax. */
function unicodeRange (chars) {
  const points = [...new Set(chars)].map((c) => c.codePointAt(0)).sort((a, b) => a - b)
  const parts = []
  let start = points[0], prev = points[0]
  for (const p of points.slice(1)) {
    if (p === prev + 1) { prev = p; continue }
    parts.push(start === prev ? `U+${start.toString(16).toUpperCase()}`
      : `U+${start.toString(16).toUpperCase()}-${prev.toString(16).toUpperCase()}`)
    start = prev = p
  }
  parts.push(start === prev ? `U+${start.toString(16).toUpperCase()}`
    : `U+${start.toString(16).toUpperCase()}-${prev.toString(16).toUpperCase()}`)
  return parts.join(',')
}

function subset (ttf, charsFile, out) {
  execFileSync('python3', [
    '-m', 'fontTools.subset', ttf,
    `--text-file=${charsFile}`, '--flavor=woff2',
    `--output-file=${out}`, '--no-hinting', '--desubroutinize'
  ], { stdio: ['ignore', 'ignore', 'inherit'] })
}

// Start clean so removed weights do not linger.
for (const f of readdirSync(FONT_DIR)) {
  if (f.endsWith('.woff2') || f === 'manifest.json') unlinkSync(join(FONT_DIR, f))
}

const faces = []

// ---- Latin ---------------------------------------------------------------
for (const [name, family] of LATIN) {
  const css = await fetchText(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, UA_MODERN)
  let i = 0
  for (const block of css.match(/@font-face\s*{[^}]+}/g) ?? []) {
    const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1]
    if (!url) continue
    const weight = block.match(/font-weight:\s*(\d+)/)?.[1] ?? '400'
    const style = block.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal'
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim()
    const file = `${name}-${weight}${style === 'italic' ? 'i' : ''}-${i++}.woff2`
    writeFileSync(join(FONT_DIR, file), await fetchBinary(url, UA_MODERN))
    faces.push({ family: name, file, weight, style, range })
  }
  console.log(`${name}: ${i} files`)
}

// ---- CJK, split into tiers ----------------------------------------------
const { tiers } = JSON.parse(readFileSync(join(ASSETS, 'cjk-tiers.json'), 'utf8'))
for (const tier of tiers) {
  writeFileSync(join(CACHE, `tier-${tier.name}.txt`), tier.chars)
}

for (const [name, family] of CJK) {
  const css = await fetchText(`https://fonts.googleapis.com/css2?family=${family}`, UA_LEGACY)
  for (const block of css.match(/@font-face\s*{[^}]+}/g) ?? []) {
    const url = block.match(/url\((https:\/\/[^)]+\.ttf)\)/)?.[1]
    if (!url) continue
    const weight = block.match(/font-weight:\s*(\d+)/)?.[1] ?? '400'

    const ttf = join(CACHE, `${name}-${weight}.ttf`)
    if (!existsSync(ttf)) writeFileSync(ttf, await fetchBinary(url, UA_LEGACY))

    let total = 0
    for (const tier of tiers) {
      const file = `${name}-${weight}-${tier.name}.woff2`
      subset(ttf, join(CACHE, `tier-${tier.name}.txt`), join(FONT_DIR, file))
      total += readFileSync(join(FONT_DIR, file)).length
      faces.push({ family: name, file, weight, style: 'normal', range: unicodeRange(tier.chars) })
    }
    console.log(`${name} ${weight}: ${tiers.length} tiers, ${(total / 1024).toFixed(0)} KB total`)
  }
}

// ---- Display face --------------------------------------------------------
{
  const [name, family] = DISPLAY
  const css = await fetchText(`https://fonts.googleapis.com/css2?family=${family}`, UA_LEGACY)
  const url = css.match(/url\((https:\/\/[^)]+\.ttf)\)/)?.[1]
  const ttf = join(CACHE, `${name}-400.ttf`)
  if (!existsSync(ttf)) writeFileSync(ttf, await fetchBinary(url, UA_LEGACY))
  // Display copy only, so the ui tier alone is enough.
  const uiTier = tiers.find((t) => t.name === 'ui')
  const file = `${name}-400.woff2`
  subset(ttf, join(CACHE, 'tier-ui.txt'), join(FONT_DIR, file))
  faces.push({ family: name, file, weight: '400', style: 'normal', range: unicodeRange(uiTier.chars) })
  console.log(`${name}: 1 file`)
}

// ---- Emit CSS ------------------------------------------------------------
const header = `/* Self-hosted typefaces — the site must not depend on a font CDN.
 *
 * GENERATED by scripts/build-fonts.mjs. Do not edit by hand.
 *
 * Families and weights match the design file's own Google Fonts request.
 *
 * Latin faces keep Google's unicode-range split. The CJK faces are subset
 * locally and split along the tiers in cjk-tiers.json — interface text, then
 * HSK 1 to 6, then characters that appear only in definitions — each with its
 * own unicode-range, so a browser downloads only the chunks whose characters
 * are on the page.
 */\n`

const css = [header]
for (const f of faces.sort((a, b) => a.family.localeCompare(b.family) || a.weight.localeCompare(b.weight) || a.file.localeCompare(b.file))) {
  css.push('@font-face {')
  css.push(`  font-family: '${CSS_FAMILY[f.family]}';`)
  css.push(`  font-style: ${f.style};`)
  css.push(`  font-weight: ${f.weight};`)
  css.push('  font-display: swap;')
  css.push(`  src: url('./fonts/${f.file}') format('woff2');`)
  if (f.range) css.push(`  unicode-range: ${f.range};`)
  css.push('}\n')
}
writeFileSync(join(ASSETS, 'fonts.css'), css.join('\n'))
writeFileSync(join(FONT_DIR, 'manifest.json'), JSON.stringify(faces, null, 2))

const bytes = readdirSync(FONT_DIR)
  .filter((f) => f.endsWith('.woff2'))
  .reduce((n, f) => n + readFileSync(join(FONT_DIR, f)).length, 0)
console.log(`\n${faces.length} @font-face rules, ${(bytes / 1024 / 1024).toFixed(2)} MB on disk`)
