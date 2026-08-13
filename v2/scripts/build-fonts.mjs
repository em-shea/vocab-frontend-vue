#!/usr/bin/env node
/**
 * Regenerate the self-hosted font subsets.
 *
 * Run this whenever display copy introduces a Chinese character that is not
 * already covered, otherwise the brush face silently falls back to the serif and
 * the heading just looks slightly wrong rather than visibly broken.
 *
 *   node scripts/build-fonts.mjs
 *
 * Requires Python with fonttools:  pip install "fonttools[woff]" brotli
 *
 * Two different subsets, because the faces do different jobs:
 *
 *   Noto Serif SC  - study content. Must cover every character the app can
 *                    display, so it is subset against hsk_vocab.csv (2 734
 *                    characters) plus hero and UI strings. 14.1 MB -> ~485 KB.
 *
 *   Ma Shan Zheng  - display only: section titles, hero names, brand marks.
 *                    Subset against DISPLAY_CHARS below. 5.6 MB -> ~30 KB.
 *                    Keep this list in sync with the brush copy in the app.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const FONT_DIR = join(HERE, '..', 'src', 'assets', 'fonts')
const TMP = join(HERE, '..', '.font-build')

// Every character rendered in the brush face anywhere in the app.
const DISPLAY_CHARS = [
  '上山聚义共一百零八人',        // the oath
  '每日一词前面',                // daily word
  '好好天天',                    // brand
  '梁山泊水浒传石碣忠义堂',      // places
  '天罡地煞英雄豪杰',            // hero tiers
  '鲁智深武松李逵',              // named heroes
  '逼上梁山聚义厅',              // narrative beats
  '印色字画卷轴',                // section marks incl. the PrintFrame placeholder
  '汉语水平考试级别词汇',        // HSK chrome
  '练习句子测验复习',            // study actions
  '订阅退订登录注册',            // account actions
  '一二三四五六七八九十'         // numerals
].join('')

const displaySet = [...new Set(DISPLAY_CHARS)].sort().join('')
mkdirSync(TMP, { recursive: true })
mkdirSync(FONT_DIR, { recursive: true })

const displayFile = join(TMP, 'display.txt')
writeFileSync(displayFile, displaySet)
console.log(`display subset: ${displaySet.length} characters`)

// Ma Shan Zheng only - the Noto Serif SC subset is driven by hsk_vocab.csv in
// the backend repo and changes far less often; see the header comment.
const ttf = join(TMP, 'MaShanZheng-400.ttf')
try {
  readFileSync(ttf)
} catch {
  console.error(
    `Missing ${ttf}.\n` +
    'Download it first (an old user-agent makes Google serve one TTF rather than\n' +
    '~100 unicode-range chunks):\n\n' +
    "  curl -A 'Mozilla/4.0' 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng'\n"
  )
  process.exit(1)
}

execFileSync('python3', [
  '-m', 'fontTools.subset', ttf,
  `--text-file=${displayFile}`,
  '--flavor=woff2',
  `--output-file=${join(FONT_DIR, 'MaShanZheng-400.woff2')}`,
  '--no-hinting',
  '--desubroutinize'
], { stdio: 'inherit' })

console.log('wrote src/assets/fonts/MaShanZheng-400.woff2')
