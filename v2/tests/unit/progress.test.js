import { describe, it, expect } from 'vitest'
import { progressRows, proficientRule } from '../../src/lib/progress'

describe('progressRows', () => {
  const body = {
    lists: [
      { list_id: 'L2', total: 300, seen: 45, proficient: 3 },
      { list_id: 'L1', total: 150, seen: 150, proficient: 151 },
      { list_id: 'L3', total: 0, seen: 0, proficient: 0 }
    ]
  }
  it('works out percentages of the whole list, capped at 100', () => {
    const rows = progressRows(body, [{ list_id: 'L1' }, { list_id: 'L2' }])
    expect(rows.map((r) => [r.list_id, r.seenPct, r.proficientPct])).toEqual([['L1', 100, 100], ['L2', 15, 1]])
  })
  it('drops empty lists and copes with a missing body', () => {
    expect(progressRows(body).map((r) => r.list_id)).toEqual(['L2', 'L1'])
    expect(progressRows(null)).toEqual([])
  })
})

describe('proficientRule', () => {
  it('reads the rule, or falls back to the same defaults', () => {
    expect(proficientRule({ proficient_rule: { min_quiz_answers: 3, min_quiz_accuracy: 0.9, quizzes_only_before: '2026-11-23' } }))
      .toEqual({ minQuizAnswers: 3, accuracyPct: 90, quizzesOnlyBefore: '2026-11-23' })
    expect(proficientRule({})).toEqual({ minQuizAnswers: 2, accuracyPct: 80, quizzesOnlyBefore: '' })
  })
})
