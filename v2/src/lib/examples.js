// Our own example sentences (Emily, 2026-11-28), replacing the YellowBridge /
// Baidu Translate links. Three per HSK word, written by AI at the word's level
// and machine-checked (scripts/examples/README.md).
//
// src/data/examples/examples-{simplified,traditional}-NN.json hold them in SHARDS files
// per character set, keyed "characters|pinyin" like the Chinese definitions,
// so showing one word's sentences fetches one small file.

import { normalisePinyin } from './cnDefinitions'

export const SHARDS = 16 // keep in step with scripts/examples/build.py

const files = import.meta.glob('../data/examples/*.json', { import: 'default' })
const cache = {}

export const shardOf = (chars) => [...chars].reduce((sum, c) => sum + c.codePointAt(0), 0) % SHARDS

function loadShard (set, n) {
  const path = `../data/examples/examples-${set}-${String(n).padStart(2, '0')}.json`
  if (!cache[path]) {
    const load = files[path]
    cache[path] = load ? load().catch(() => { delete cache[path]; return {} }) : Promise.resolve({})
  }
  return cache[path]
}

/** The word's example sentences as [{ zh, pinyin, en }], or [] if it has none. */
export async function examplesFor (word, traditional = false) {
  const chars = word?.simplified ?? word?.Simplified ?? ''
  if (!chars) return []
  const data = await loadShard(traditional ? 'traditional' : 'simplified', shardOf(chars))
  const rows = data[`${chars}|${normalisePinyin(word.pinyin ?? word.Pinyin)}`] ?? []
  return rows.map(([zh, pinyin, en]) => ({ zh, pinyin, en }))
}
