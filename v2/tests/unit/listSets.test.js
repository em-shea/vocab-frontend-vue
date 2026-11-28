import { describe, it, expect } from 'vitest'
import { setsOf, usesBothSets, isTraditionalFor, withSetMarks, wordCharacters } from '../../src/lib/listSets'

const subs = [
  { list_id: 'a', character_set: 'simplified' },
  { list_id: 'b', character_set: 'traditional' },
  { list_id: 'c', character_set: 'simplified' },
  { list_id: 'c', character_set: 'traditional' }
]

describe('list character sets', () => {
  it('knows the sets each list is taken in', () => {
    expect(setsOf(subs, 'c')).toEqual(['simplified', 'traditional'])
    expect(usesBothSets(subs)).toBe(true)
    expect(usesBothSets(subs.slice(0, 1))).toBe(false)
  })
  it('a list in one set decides; a list in both follows the globe menu', () => {
    expect(isTraditionalFor(subs, 'b', false)).toBe(true)
    expect(isTraditionalFor(subs, 'a', true)).toBe(false)
    expect(isTraditionalFor(subs, 'c', true)).toBe(true)
    expect(isTraditionalFor(subs, 'c', false)).toBe(false)
  })
  it('marks names only when the lists span both sets', () => {
    expect(withSetMarks(subs, 'b', 'HSK 3')).toBe('HSK 3 繁')
    expect(withSetMarks(subs, 'c', 'HSK 1')).toBe('HSK 1 简 繁')
    expect(withSetMarks(subs.slice(1, 2), 'b', 'HSK 3')).toBe('HSK 3')
  })
  it('falls back to simplified characters', () => {
    expect(wordCharacters({ simplified: '学习', traditional: '學習' }, true)).toBe('學習')
    expect(wordCharacters({ simplified: '学习' }, true)).toBe('学习')
  })
})
