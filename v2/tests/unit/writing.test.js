import { describe, it, expect } from 'vitest'
import { charactersOf, writingPayload, strokeDataUrl } from '../../src/lib/writing'

describe('charactersOf', () => {
  it('splits a word into its characters, in the chosen set', () => {
    expect(charactersOf({ simplified: '爱护', traditional: '愛護' })).toEqual(['爱', '护'])
    expect(charactersOf({ simplified: '爱护', traditional: '愛護' }, true)).toEqual(['愛', '護'])
  })
  it('falls back to simplified, keeps repeats once and skips non-Han', () => {
    expect(charactersOf({ simplified: '妈妈' }, true)).toEqual(['妈'])
    expect(charactersOf({ simplified: 'T恤' })).toEqual(['恤'])
    expect(charactersOf({})).toEqual([])
  })
})

describe('writingPayload', () => {
  it('names the word, its list and its date', () => {
    const entry = { list_id: 'L1', date_sent: '2026-11-20', word: { word_id: 'W1', simplified: '爱护' } }
    expect(writingPayload(entry, 'traditional')).toEqual({
      list_id: 'L1', word_id: 'W1', characters: '爱护', character_set: 'traditional', date: '2026-11-20'
    })
  })
})

describe('strokeDataUrl', () => {
  it('points at the pinned data version', () => {
    expect(strokeDataUrl('爱')).toBe('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/%E7%88%B1.json')
  })
})
