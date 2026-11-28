import { describe, it, expect } from 'vitest'
import { examplesFor, shardOf, SHARDS } from '../../src/lib/examples'

describe('example sentences', () => {
  it('finds three for an HSK word by characters and pinyin', async () => {
    const rows = await examplesFor({ simplified: '朋友', pinyin: 'péng you' })
    expect(rows).toHaveLength(3)
    for (const r of rows) {
      expect(r.zh).toContain('朋友')
      expect(r.pinyin).toBeTruthy()
      expect(r.en).toBeTruthy()
    }
  })
  it('gives traditional characters for a traditional list', async () => {
    const rows = await examplesFor({ simplified: '爱护', pinyin: 'ài hù' }, true)
    expect(rows[0].zh).toContain('愛護')
  })
  it('gives none for words it does not know', async () => {
    expect(await examplesFor({ simplified: '不存在的词', pinyin: 'x' })).toEqual([])
    expect(await examplesFor({})).toEqual([])
  })
  it('spreads words over the shards', () => {
    expect(shardOf('朋友')).toBeGreaterThanOrEqual(0)
    expect(shardOf('朋友')).toBeLessThan(SHARDS)
  })
})
