import { describe, it, expect } from 'vitest'
import {
  uniqueWords, canQuiz, fieldText, makeQuestion, percent, resultsPayload, shuffle, OPTIONS_PER_QUESTION
} from '../../src/lib/quiz'

const entry = (id, simplified, pinyin, definition, traditional = simplified) => ({
  list_id: 'L', date_sent: '2026-11-12', word: { word_id: id, simplified, traditional, pinyin, definition }
})

const TWO = [
  entry('a', '朋友', 'péng you', 'friend'),
  entry('b', '学习', 'xué xí', 'to study', '學習'),
  entry('c', '爱护', 'ài hù', 'to cherish', '愛護'),
  entry('d', '帮助', 'bāng zhù', 'to help', '幫助'),
  entry('e', '老师', 'lǎo shī', 'teacher', '老師')
]
const ONE = [
  entry('f', '是', 'shì', 'to be'),
  entry('g', '好', 'hǎo', 'good'),
  entry('h', '大', 'dà', 'big')
]

// A seeded generator so failures can be reproduced.
function seeded (seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

describe('uniqueWords', () => {
  it('keeps one entry per word, the last one sent', () => {
    const again = { ...TWO[0], date_sent: '2026-11-14' }
    const result = uniqueWords([TWO[0], TWO[1], again])
    expect(result).toHaveLength(2)
    expect(result.find((e) => e.word.word_id === 'a').date_sent).toBe('2026-11-14')
  })

  it('needs four words to make a quiz', () => {
    expect(canQuiz(TWO.slice(0, 3))).toBe(false)
    expect(canQuiz(TWO.slice(0, 4))).toBe(true)
  })
})

describe('fieldText', () => {
  it('follows the character set, falling back to simplified', () => {
    expect(fieldText(TWO[1], 'characters', 'traditional')).toBe('學習')
    expect(fieldText(TWO[1], 'characters', 'simplified')).toBe('学习')
    expect(fieldText({ word: { simplified: '你' } }, 'characters', 'traditional')).toBe('你')
    expect(fieldText(TWO[1], 'pinyin')).toBe('xué xí')
  })
})

describe('makeQuestion', () => {
  it('always offers four options including the answer, over many draws', () => {
    const words = [...TWO, ...ONE]
    const random = seeded(7)
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion(words, { random })
      expect(q.options).toHaveLength(OPTIONS_PER_QUESTION)
      expect(q.options).toContain(q.answer)
      expect(new Set(q.options).size).toBe(OPTIONS_PER_QUESTION)
    }
  })

  it('only pairs characters with pinyin when every option has the same length', () => {
    const words = [...TWO, ...ONE, entry('i', '人', 'rén', 'person')]
    const random = seeded(11)
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion(words, { random })
      const pairsCharsAndPinyin = [q.type.question, q.type.answers].sort().join() === 'characters,pinyin'
      if (!pairsCharsAndPinyin) continue
      const lengths = new Set(q.options.map((o) => [...o.word.simplified].length))
      expect(lengths.size).toBe(1)
    }
  })

  it('never offers two options that read the same', () => {
    // Two words both defined "to be": only one may appear when answering with definitions.
    const words = [...TWO, entry('x', '是', 'shì', 'to be'), entry('y', '系', 'xì', 'to be')]
    const random = seeded(3)
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion(words, { random })
      const shown = q.options.map((o) => fieldText(o, q.type.answers))
      expect(new Set(shown).size).toBe(shown.length)
    }
  })

  it('never offers a second word that also fits the prompt', () => {
    const words = [...TWO, entry('x', '是', 'shì', 'to be'), entry('y', '系', 'xì', 'to be')]
    const random = seeded(9)
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion(words, { random })
      const prompt = fieldText(q.answer, q.type.question)
      const fits = q.options.filter((o) => fieldText(o, q.type.question) === prompt)
      expect(fits).toEqual([q.answer])
    }
  })

  it('does not ask about the same word twice in a row', () => {
    const random = seeded(5)
    let previous = null
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion(TWO, { previous, random })
      expect(q.answer).not.toBe(previous)
      previous = q.answer
    }
  })

  it('returns nothing rather than a broken question when there are too few words', () => {
    expect(makeQuestion(TWO.slice(0, 3))).toBeNull()
  })
})

describe('results', () => {
  it('rounds the score as a percentage', () => {
    expect(percent(7, 10)).toBe('70%')
    expect(percent(2, 3)).toBe('67%')
    expect(percent(0, 0)).toBe('0%')
  })

  it('builds the payload the API stores, with the concrete character field', () => {
    const type = { question: 'characters', answers: 'definition' }
    const payload = resultsPayload({
      listId: 'L',
      characterSet: 'traditional',
      range: 14,
      length: 2,
      answers: [
        { answer: TWO[0], chosen: TWO[0], correct: true, type },
        { answer: TWO[1], chosen: TWO[2], correct: false, type }
      ]
    })
    expect(payload).toEqual({
      list_id: 'L',
      character_set: 'traditional',
      date_range: 14,
      question_quantity: 2,
      correct_answers: 1,
      quiz_data: [
        { correct_answer: TWO[0], answer_submitted: TWO[0], was_answer_correct: true, test_set: { question: 'traditional', answers: 'definition' } },
        { correct_answer: TWO[1], answer_submitted: TWO[2], was_answer_correct: false, test_set: { question: 'traditional', answers: 'definition' } }
      ]
    })
  })

  it('shuffle leaves its input alone', () => {
    const input = [1, 2, 3, 4]
    shuffle(input)
    expect(input).toEqual([1, 2, 3, 4])
  })
})
