import { describe, it, expect } from 'vitest'
import { listLabelFor } from '../../src/lib/listLabel'

const cn = (key, { n }) => `HSK ${n}级`
const en = (key, { n }) => `HSK Level ${n}`

describe('listLabelFor', () => {
  it('translates HSK list names', () => {
    expect(listLabelFor('HSK Level 3', cn)).toBe('HSK 3级')
    expect(listLabelFor('HSK Level 3', en)).toBe('HSK Level 3')
  })
  it('leaves other names alone', () => {
    expect(listLabelFor('My kitchen words', cn)).toBe('My kitchen words')
    expect(listLabelFor('', cn)).toBe('')
  })
})
