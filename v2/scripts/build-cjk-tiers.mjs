#!/usr/bin/env node
/**
 * Generate the character tiers the CJK fonts are split along.
 *
 *   node scripts/build-cjk-tiers.mjs [path/to/hsk_vocab.csv]
 *
 * Writes src/assets/cjk-tiers.json, which is committed so the font build does
 * not depend on the backend repo being checked out next door.
 *
 * Why tiers: each CJK face was previously one file covering all ~2 700
 * characters, with no unicode-range, so any page touching that face downloaded
 * the whole thing — 1.37 MB to show about twenty characters. Splitting along
 * HSK level means a browser fetches only the chunks whose characters are
 * actually on the page, and HSK level is already a frequency ordering: a
 * subscriber to HSK 1 only ever sees HSK 1 words.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
// Characters per HSK level, BOTH simplified and traditional, pulled from the
// word records in DynamoDB by scripts/pull-hsk-chars.py and committed here.
//
// hsk_vocab.csv carries only the simplified form. A subset built from it misses
// roughly 900 traditional characters, and a traditional-set subscriber then gets
// system fallback glyphs across the site — which looks almost right, so it is
// easy to miss.
const CHARS = join(HERE, 'hsk-chars.json')
const OUT = join(HERE, '..', 'src', 'assets', 'cjk-tiers.json')

// Interface and narrative text: always needed, so it loads as one small chunk
// regardless of which vocabulary a page shows.
const UI_CHARS =
  '上山聚义共一百零八人每日一词前面好好天天梁山泊水浒传石碣忠义堂' +
  '天罡地煞英雄豪杰鲁智深武松李逵逼上梁山聚义厅印色字画卷轴' +
  '汉语水平考试级别词汇练习句子测验复习订阅退订登录注册' +
  '一二三四五六七八九十首页测验复习收集位已聚天连续学中文步接近目标' +
  '选择等电子邮箱简体繁体'
// Punctuation that appears in Chinese copy and definitions.
const PUNCT = '，。、；：？！「」『』（）《》〈〉—…·　'

const isHan = (ch) => ch >= '一' && ch <= '鿿'

const byLevel = new Map(
  Object.entries(JSON.parse(readFileSync(CHARS, 'utf8'))).map(([lvl, chars]) => [lvl, new Set(chars)])
)

const tiers = []
const claimed = new Set()

function addTier (name, chars) {
  const unique = [...new Set(chars)].filter((c) => !claimed.has(c)).sort()
  unique.forEach((c) => claimed.add(c))
  if (unique.length) tiers.push({ name, chars: unique.join('') })
}

addTier('ui', [...UI_CHARS, ...PUNCT].filter((c) => isHan(c) || PUNCT.includes(c)))
for (const level of [...byLevel.keys()].sort()) addTier(`hsk${level}`, [...byLevel.get(level)])


const total = tiers.reduce((n, t) => n + [...t.chars].length, 0)
writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), tiers }, null, 2))

console.log(`${tiers.length} tiers, ${total} characters total`)
for (const t of tiers) console.log(`  ${t.name.padEnd(7)} ${String([...t.chars].length).padStart(5)}`)
console.log(`\nwrote ${OUT}`)
