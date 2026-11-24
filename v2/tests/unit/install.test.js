import { describe, it, expect, beforeEach } from 'vitest'
import { hasFinishedTask, dismissedRecently, dismiss } from '../../src/lib/install'

describe('install prompt rules', () => {
  beforeEach(() => localStorage.clear())

  it('waits for a first finished quiz, sentence or stroke order practice', () => {
    expect(hasFinishedTask([], {})).toBe(false)
    expect(hasFinishedTask([], { '2026-11-24': { review_words: [{ list_id: 'L1' }] } })).toBe(false)
    expect(hasFinishedTask([{ quiz_id: 'q' }], {})).toBe(true)
    expect(hasFinishedTask([], { d: { review_words: [{ sentence: { sentence: '我爱你。' } }] } })).toBe(true)
    expect(hasFinishedTask([], { d: { review_words: [{ written: true }] } })).toBe(true)
    expect(hasFinishedTask([], { d: { quiz: { score: 5 } } })).toBe(true)
  })

  it('stays quiet for 30 days after Not now', () => {
    const day = 24 * 60 * 60 * 1000
    expect(dismissedRecently(0)).toBe(false)
    dismiss(1000)
    expect(dismissedRecently(1000 + 29 * day)).toBe(true)
    expect(dismissedRecently(1000 + 31 * day)).toBe(false)
  })
})
