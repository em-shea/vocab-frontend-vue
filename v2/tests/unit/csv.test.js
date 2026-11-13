import { describe, it, expect } from 'vitest'
import { csvField, toCsv } from '../../src/lib/csv'

describe('csv export', () => {
  it('leaves plain text and Chinese alone', () => {
    expect(csvField('爱护')).toBe('爱护')
    expect(csvField('to cherish')).toBe('to cherish')
  })

  it('quotes commas, quotes and line breaks so a definition stays in one cell', () => {
    expect(csvField('to study, to learn')).toBe('"to study, to learn"')
    expect(csvField('the "old" way')).toBe('"the ""old"" way"')
    expect(csvField('one\ntwo')).toBe('"one\ntwo"')
  })

  it('writes nothing for missing values rather than "undefined"', () => {
    expect(csvField(undefined)).toBe('')
    expect(csvField(null)).toBe('')
    expect(csvField(0)).toBe('0')
  })

  it('defuses text a spreadsheet would run as a formula', () => {
    expect(csvField('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)")
    expect(csvField('-er (suffix)')).toBe("'-er (suffix)")
    expect(csvField('@home')).toBe("'@home")
  })

  it('writes a header and one line per row, in column order', () => {
    const text = toCsv([{ b: 2, a: 'x,y' }, { a: '学习' }], ['a', 'b'])
    expect(text).toBe('a,b\r\n"x,y",2\r\n学习,\r\n')
  })
})
