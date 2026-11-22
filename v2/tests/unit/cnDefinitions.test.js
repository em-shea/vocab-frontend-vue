import { describe, it, expect } from 'vitest'
import { cnDefinitionFrom, normalisePinyin } from '../../src/lib/cnDefinitions'
import simplified from '../../src/data/cn-definitions.json'
import traditional from '../../src/data/cn-definitions-trad.json'

const DATA = {
  '爱护|ài hù': '爱惜并保护',
  '对|duì|for; to': '介词，表示动作涉及的对象',
  '对|duì|right': '正确，没有错误'
}

describe('cnDefinitionFrom', () => {
  it('finds a word by characters and pinyin', () => {
    expect(cnDefinitionFrom(DATA, { simplified: '爱护', pinyin: 'ài hù' })).toBe('爱惜并保护')
  })

  it('accepts the capitalised record shape and untidy pinyin', () => {
    expect(cnDefinitionFrom(DATA, { Simplified: '爱护', Pinyin: ' Ài  hù ' })).toBe('爱惜并保护')
    expect(normalisePinyin(' Ài  hù ')).toBe('ài hù')
  })

  it('tells a word listed twice apart by its English definition', () => {
    expect(cnDefinitionFrom(DATA, { simplified: '对', pinyin: 'duì', definition: 'right' })).toBe('正确，没有错误')
    expect(cnDefinitionFrom(DATA, { simplified: '对', pinyin: 'duì', definition: 'for; to' })).toBe('介词，表示动作涉及的对象')
  })

  it('gives nothing for words it does not cover', () => {
    expect(cnDefinitionFrom(DATA, { simplified: '电脑', pinyin: 'diàn nǎo' })).toBe('')
    expect(cnDefinitionFrom(null, { simplified: '爱护', pinyin: 'ài hù' })).toBe('')
  })
})

describe('the definition files', () => {
  it('cover every HSK word, in both character sets, with the same keys', () => {
    expect(Object.keys(simplified).length).toBe(5003)
    expect(Object.keys(traditional)).toEqual(Object.keys(simplified))
  })
})
