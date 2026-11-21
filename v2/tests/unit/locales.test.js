import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import en from '../../src/locales/en'
import cn from '../../src/locales/cn'

// The interface is fully bilingual. A key present in one language and missing
// from the other does not fail loudly: vue-i18n falls back to English, so the
// Chinese interface quietly shows an English string. These tests are the only
// thing that notices.

describe('interface copy', () => {
  it('has exactly the same keys in English and Chinese', () => {
    expect(Object.keys(cn).sort()).toEqual(Object.keys(en).sort())
  })

  it.each(Object.entries({ en, cn }))('has no empty strings in %s', (_name, messages) => {
    const empty = Object.entries(messages).filter(([, v]) => typeof v !== 'string' || !v.trim())
    expect(empty.map(([k]) => k)).toEqual([])
  })

  it('defines every key the templates ask for', () => {
    // A typo in t('…') renders the raw key name on the page. Collect every
    // literal key used under src/ and make sure it exists.
    const used = new Set()
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) walk(path)
        else if (/\.(vue|js)$/.test(entry.name)) {
          for (const m of readFileSync(path, 'utf8').matchAll(/\bt\(\s*'([^']+)'/g)) used.add(m[1])
        }
      }
    }
    walk(join(__dirname, '../../src'))
    expect(used.size).toBeGreaterThan(0)
    expect([...used].filter((key) => !(key in en))).toEqual([])
  })
})
