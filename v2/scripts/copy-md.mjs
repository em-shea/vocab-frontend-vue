#!/usr/bin/env node
/**
 * Move the site's copy between the locale files and an editable markdown file.
 *
 *   node scripts/copy-md.mjs export   # locales  -> content/homepage.md
 *   node scripts/copy-md.mjs import   # homepage.md -> locales
 *
 * The locale files are JS objects — fine for the app, awkward for writing prose
 * in. This gives one markdown file grouped by the section each string appears
 * in, with the English and Chinese together so they can be edited side by side.
 *
 * Keys are the design file's own names and are the join between the two formats,
 * so the headings are labels for humans and the `key:` lines are what matter.
 * Import rewrites both locale files in place; it never invents or drops a key.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const LOCALES = join(HERE, '..', 'src', 'locales')
const MD = join(HERE, '..', 'content', 'homepage.md')

// Section order follows the page. Anything not listed lands under "Other", so a
// new key is never silently lost.
const SECTIONS = [
  ['Header and navigation', ['tagline', 'navHome', 'navQuiz', 'navReview', 'navSignIn', 'immersion', 'simplified', 'traditional']],
  ['1. Quest', ['questKicker', 'questHeadlineA', 'questHeadlineB', 'questBody', 'questNote', 'questCta']],
  ['2. Subscribe', ['subscribeLine', 'chooseLevel', 'email', 'subscribe', 'subNote']],
  ['3. The story', ['markStory', 'storyKicker', 'storyHeadline', 'storyBody', 'storyBody2']],
  ['4. Daily word', ['markHow', 'dailyHeadline', 'dailyBody', 'beat1', 'beat2', 'beat3', 'defQianMian']],
  ['5. Your level', ['markLevels', 'levelHeadline', 'levelBody', 'whichLevel', 'clickPre', 'recentWords', 'clickPost', 'uploadOwn',
    'level1', 'level2', 'level3', 'level4', 'level5', 'level6',
    'defHen', 'defFeiji', 'defDu', 'defBaba']],
  ['6. The 108', ['markHeroes', 'collectHeadline', 'collectBody', 'abilityLabel', 'abilityName', 'abilityNote']],
  ['7. Join the oath', ['markJoin', 'closeHeadlineA', 'closeHeadlineB', 'closeBody', 'boardNote']],
  ['Progress', ['dayStreak', 'wordsSeen', 'heroesGathered', 'weekProgress', 'markDaily', 'markWords']],
  ['FAQ', ['markFaq', 'faq1zhq', 'faq1q', 'faq1a', 'faq2zhq', 'faq2q', 'faq2a',
    'faq3zhq', 'faq3q', 'faq3a', 'faq4zhq', 'faq4q', 'faq4a']]
]

async function readLocale (name) {
  const mod = await import(join(LOCALES, `${name}.js`))
  return mod.default
}

function esc (value) {
  // Keep multi-line strings on one line in the markdown; \n is written out.
  return String(value).replace(/\n/g, '\\n')
}

function unesc (value) {
  return value.replace(/\\n/g, '\n')
}

async function exportMd () {
  const en = await readLocale('en')
  const cn = await readLocale('cn')

  const placed = new Set(SECTIONS.flatMap(([, keys]) => keys))
  const leftover = Object.keys(en).filter((k) => !placed.has(k))
  const groups = leftover.length ? [...SECTIONS, ['Other', leftover]] : SECTIONS

  const out = [
    '# Homepage copy',
    '',
    'Edit the text after `en:` and `cn:` and run:',
    '',
    '```',
    'node scripts/copy-md.mjs import',
    '```',
    '',
    'Rules:',
    '',
    '- Do not change a `key:` line. It is how a string finds its way back.',
    '- Keep each value on one line; write a line break as `\\n`.',
    '- Headings are for orientation only — moving a key between sections changes',
    '  nothing in the app.',
    '',
    '---',
    ''
  ]

  for (const [title, keys] of groups) {
    const present = keys.filter((k) => k in en)
    if (!present.length) continue
    out.push(`## ${title}`, '')
    for (const key of present) {
      out.push(`key: ${key}`)
      out.push(`en: ${esc(en[key])}`)
      out.push(`cn: ${esc(cn[key] ?? en[key])}`)
      out.push('')
    }
  }

  mkdirSync(dirname(MD), { recursive: true })
  writeFileSync(MD, out.join('\n'))
  const count = groups.reduce((n, [, keys]) => n + keys.filter((k) => k in en).length, 0)
  console.log(`wrote ${MD}\n${count} strings across ${groups.length} sections`)
}

async function importMd () {
  const text = readFileSync(MD, 'utf8')
  const en = {}
  const cn = {}
  let key = null

  for (const line of text.split('\n')) {
    const k = line.match(/^key:\s*(\S+)\s*$/)
    if (k) { key = k[1]; continue }
    if (!key) continue
    const e = line.match(/^en:\s?([\s\S]*)$/)
    if (e) { en[key] = unesc(e[1]); continue }
    const c = line.match(/^cn:\s?([\s\S]*)$/)
    if (c) { cn[key] = unesc(c[1]) }
  }

  const current = await readLocale('en')
  const missing = Object.keys(current).filter((k) => !(k in en))
  if (missing.length) {
    console.error(`Refusing to write: ${missing.length} key(s) missing from the markdown — ${missing.join(', ')}`)
    process.exit(1)
  }

  for (const [name, data] of [['en', en], ['cn', cn]]) {
    const header = readFileSync(join(LOCALES, `${name}.js`), 'utf8').split('\nexport default')[0]
    writeFileSync(
      join(LOCALES, `${name}.js`),
      `${header}\nexport default ${JSON.stringify(data, null, 2)}\n`
    )
  }
  console.log(`updated src/locales/en.js and cn.js — ${Object.keys(en).length} strings`)
}

const cmd = process.argv[2]
if (cmd === 'export') await exportMd()
else if (cmd === 'import') await importMd()
else {
  console.error('Usage: node scripts/copy-md.mjs export|import')
  process.exit(1)
}
