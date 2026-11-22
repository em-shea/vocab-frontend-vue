import { describe, it, expect } from 'vitest'
import {
  NOT_SET, PROFILE_NAMES, isSet, profileName, rubyPairs, namePayload, nameOptions,
  todayKey, todaysQuiz, latestWords, quizHistory, scorePercent, wordProgress, progressCount
} from '../../src/lib/profile'

const HSK1 = 'list-1'
const HSK2 = 'list-2'
const word = (listId, date, simplified) => ({ list_id: listId, date_sent: date, word: { word_id: simplified, simplified } })
const sub = (listId, characterSet = 'simplified') => ({ list_id: listId, character_set: characterSet, status: 'subscribed' })

describe('profile name', () => {
  it('treats the backend\'s "Not set" and blanks as no name', () => {
    expect(isSet(NOT_SET)).toBe(false)
    expect(isSet('')).toBe(false)
    expect(isSet(undefined)).toBe(false)
    expect(isSet('小安')).toBe(true)
    expect(profileName({ user_alias: NOT_SET, user_alias_pinyin: NOT_SET })).toBeNull()
    expect(profileName({ user_alias: '小安', user_alias_pinyin: NOT_SET })).toEqual({ name: '小安', pinyin: '' })
  })

  it('pairs each character with its syllable, or not at all', () => {
    expect(rubyPairs('小安', 'xiǎo ān')).toEqual([{ char: '小', pinyin: 'xiǎo' }, { char: '安', pinyin: 'ān' }])
    expect(rubyPairs('小安', 'xiǎoān')).toBeNull()
    expect(rubyPairs('小安', '')).toBeNull()
  })

  it('writes the old screen\'s fields, clearing with "Not set"', () => {
    expect(namePayload({ character: '小安', pinyin: 'xiǎo ān' })).toEqual({ user_alias: '小安', user_alias_pinyin: 'xiǎo ān' })
    expect(namePayload(null)).toEqual({ user_alias: NOT_SET, user_alias_pinyin: NOT_SET })
    expect(namePayload({ character: '小安', pinyin: '' })).toEqual({ user_alias: '小安', user_alias_pinyin: NOT_SET })
  })

  it('offers the old list, with a stored name that is not on it kept first', () => {
    expect(PROFILE_NAMES).toHaveLength(101)
    expect(PROFILE_NAMES.some((n) => n.character === NOT_SET)).toBe(false)
    expect(nameOptions({ user_alias: '小安' })).toBe(PROFILE_NAMES)
    const options = nameOptions({ user_alias: '宋江', user_alias_pinyin: 'sòng jiāng' })
    expect(options[0]).toEqual({ character: '宋江', pinyin: 'sòng jiāng' })
    expect(options).toHaveLength(102)
  })
})

describe('today', () => {
  it('is the UTC date, as the backend keys it', () => {
    // 01:00 on the 20th in Tokyo is still the 19th in UTC.
    expect(todayKey(new Date('2026-11-20T01:00:00+09:00'))).toBe('2026-11-19')
  })

  it('finds today\'s quiz, and does not fail when today is missing', () => {
    const now = new Date('2026-11-20T12:00:00Z')
    const quiz = { correct_answers: 8, question_quantity: 10 }
    expect(todaysQuiz({ '2026-11-20': { review_words: [], quiz } }, now)).toBe(quiz)
    expect(todaysQuiz({ '2026-11-20': { review_words: [] } }, now)).toBeNull()
    expect(todaysQuiz({ '2026-11-19': { review_words: [], quiz } }, now)).toBeNull()
    expect(todaysQuiz(undefined, now)).toBeNull()
  })
})

describe('latestWords', () => {
  const activity = {
    '2026-11-18': { review_words: [word(HSK1, '2026-11-18', '朋友'), word(HSK2, '2026-11-18', '帮助')] },
    '2026-11-20': { review_words: [] },
    '2026-11-19': { review_words: [word(HSK1, '2026-11-19', '学习')] }
  }

  it('takes the newest word per subscribed list, in subscription order', () => {
    const words = latestWords(activity, [sub(HSK1), sub(HSK2)])
    expect(words.map((w) => w.word.simplified)).toEqual(['学习', '帮助'])
  })

  it('shows a list taken in both character sets once', () => {
    expect(latestWords(activity, [sub(HSK1), sub(HSK1, 'traditional')])).toHaveLength(1)
  })

  it('leaves out lists with nothing sent yet, and copes with no activity', () => {
    expect(latestWords(activity, [sub('list-new')])).toEqual([])
    expect(latestWords(undefined, [sub(HSK1)])).toEqual([])
  })
})

describe('quizHistory', () => {
  it('lists newest first, the later of two on one day first', () => {
    const quizzes = [
      { quiz_id: 'a', date_created: '2026-11-17' },
      { quiz_id: 'b', date_created: '2026-11-19' },
      { quiz_id: 'c', date_created: '2026-11-19' },
      { quiz_id: 'd', date_created: '2026-11-18' }
    ]
    expect(quizHistory(quizzes).map((q) => q.quiz_id)).toEqual(['c', 'b', 'd', 'a'])
    expect(quizHistory(null)).toEqual([])
  })

  it('rounds the score', () => {
    expect(scorePercent({ correct_answers: 2, question_quantity: 3 })).toBe('67%')
    expect(scorePercent({ correct_answers: 0, question_quantity: 0 })).toBe('0%')
  })
})

describe('wordProgress', () => {
  const entry = (list, date, id) => ({ list_id: list, date_sent: date, word: { word_id: id, simplified: id } })
  const words = [entry('L1', '2026-11-20', 'a'), entry('L2', '2026-11-20', 'b')]

  it('counts a quiz on that list saved on or after the word was sent', () => {
    const quizzes = [
      { list_id: 'L1', date_created: '2026-11-21' },
      { list_id: 'L2', date_created: '2026-11-19' }
    ]
    const p = wordProgress(words, quizzes, {})
    expect(p.map((x) => Boolean(x.quiz))).toEqual([true, false])
    expect(progressCount(p, 'quiz')).toEqual({ done: 1, total: 2 })
  })

  it('counts a sentence filed with the word on its day, in either character set', () => {
    const activity = {
      '2026-11-20': {
        review_words: [
          { ...entry('L1', '2026-11-20', 'a') },
          { ...entry('L1', '2026-11-20', 'a'), sentence: { sentence: '我爱你。' } },
          { ...entry('L2', '2026-11-20', 'b'), sentence: { sentence: '' } }
        ]
      }
    }
    const p = wordProgress(words, [], activity)
    expect(p.map((x) => x.sentence?.sentence ?? null)).toEqual(['我爱你。', null])
    expect(progressCount(p, 'sentence')).toEqual({ done: 1, total: 2 })
  })

  it('is empty with no words', () => {
    expect(progressCount(wordProgress([], [], {}), 'quiz')).toEqual({ done: 0, total: 0 })
  })
})
