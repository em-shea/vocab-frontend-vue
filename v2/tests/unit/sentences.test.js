import { describe, it, expect } from 'vitest'
import {
  todayKey, todaysWords, wordsBySentenceId, sentencesFrom, activityFrom, newestFirst, upsert, exampleLink, recentDays,
  clean, newSentenceId, storedWord, savePayload
} from '../../src/lib/sentences'

const word = (id, simplified, extra = {}) => ({
  word_id: id, simplified, traditional: simplified, pinyin: 'p', definition: 'd', audio_file_key: '', difficulty_level: 'Beginner', hsk_level: '1', ...extra
})
const sent = (listId, date, w, sentence) => ({ list_id: listId, date_sent: date, word: w, ...(sentence ? { sentence } : {}) })

// The shape GET /user_activity gives: newest date first, as the handler builds it.
const ACTIVITY = {
  '2026-11-20': {
    review_words: [
      sent('L1', '2026-11-20', word('a', '朋友')),
      sent('L1', '2026-11-20', word('b', '爱护'), { sentence_id: 's1', sentence: '请爱护书。' }),
      // Same list in the other character set: the same word again.
      sent('L1', '2026-11-20', word('a', '朋友'), { sentence_id: 's0', sentence: '朋友好。' }),
      sent('L2', '2026-11-20', word('a', '朋友'))
    ]
  },
  '2026-11-19': { review_words: [sent('L1', '2026-11-19', word('c', '学习'), { sentence_id: 's2', sentence: '学习。' })] },
  '2026-11-18': { review_words: [] }
}

describe('todayKey', () => {
  it('is the newest date the server sent, whatever order the keys come in', () => {
    expect(todayKey(ACTIVITY)).toBe('2026-11-20')
    expect(todayKey({ '2026-01-02': {}, '2026-01-03': {}, '2025-12-31': {} })).toBe('2026-01-03')
    expect(todayKey({})).toBeNull()
    expect(todayKey(undefined)).toBeNull()
  })
})

describe('todaysWords', () => {
  it('gives each of today\'s words once per list, keeping the copy with a sentence', () => {
    const words = todaysWords(ACTIVITY)
    expect(words.map((e) => `${e.list_id}:${e.word.word_id}`)).toEqual(['L1:a', 'L1:b', 'L2:a'])
    expect(words[0].sentence.sentence_id).toBe('s0')
  })

  it('is empty with no activity', () => {
    expect(todaysWords({})).toEqual([])
    expect(todaysWords({ '2026-11-20': {} })).toEqual([])
  })

  it('skips a newest day with no words yet, like the word card does', () => {
    const words = todaysWords({ '2026-11-21': { review_words: [] }, ...ACTIVITY })
    expect(words.map((e) => `${e.list_id}:${e.word.word_id}`)).toEqual(['L1:a', 'L1:b', 'L2:a'])
  })
})

describe('wordsBySentenceId', () => {
  it('maps every sentence in the activity to its word', () => {
    const map = wordsBySentenceId(ACTIVITY)
    expect(Object.keys(map).sort()).toEqual(['s0', 's1', 's2'])
    expect(map.s2.simplified).toBe('学习')
  })
})

describe('unwrapping responses', () => {
  it('reads sentences from the { success, message, data } wrapper', () => {
    expect(sentencesFrom({ success: true, data: { sentences: [{ sentence_id: 'x' }] } })).toHaveLength(1)
    expect(sentencesFrom({ sentences: [{ sentence_id: 'x' }] })).toHaveLength(1)
    expect(sentencesFrom({ success: false, data: null })).toEqual([])
    expect(sentencesFrom(undefined)).toEqual([])
  })

  it('reads the activity from the bare user record', () => {
    expect(activityFrom({ email_address: 'e', activity: ACTIVITY })).toBe(ACTIVITY)
    expect(activityFrom({ data: { activity: ACTIVITY } })).toBe(ACTIVITY)
    expect(activityFrom({})).toEqual({})
  })
})

describe('ordering', () => {
  const s = (id, date) => ({ sentence_id: id, sentence: id, date_created: date })

  it('puts the newest first', () => {
    const sorted = newestFirst([s('a', '2025-01-01'), s('c', '2026-11-20'), s('b', '2026-11-19')])
    expect(sorted.map((x) => x.sentence_id)).toEqual(['c', 'b', 'a'])
  })

  it('adds a new sentence, or replaces one with the same id', () => {
    const list = [s('a', '2026-11-19')]
    expect(upsert(list, s('b', '2026-11-20')).map((x) => x.sentence_id)).toEqual(['b', 'a'])
    const replaced = upsert(list, { ...s('a', '2026-11-20'), sentence: 'new' })
    expect(replaced).toHaveLength(1)
    expect(replaced[0].sentence).toBe('new')
    expect(list[0].sentence).toBe('a')
  })
})

describe('saving', () => {
  it('trims what is saved', () => {
    expect(clean('  你好。 \n')).toBe('你好。')
    expect(clean('   ')).toBe('')
    expect(clean(undefined)).toBe('')
  })

  it('makes a fresh id each time', () => {
    const a = newSentenceId()
    expect(a).toMatch(/\S{8,}/)
    expect(newSentenceId()).not.toBe(a)
  })

  it('stores the word with the word table\'s own keys', () => {
    expect(storedWord(word('a', '朋友', { audio_file_key: 'https://x/a.mp3' }))).toEqual({
      'Word id': 'a',
      Simplified: '朋友',
      Traditional: '朋友',
      Pinyin: 'p',
      Definition: 'd',
      'Audio file key': 'https://x/a.mp3',
      'Difficulty level': 'Beginner',
      'HSK Level': '1'
    })
    expect(storedWord({ simplified: '你' })['HSK Level']).toBe('')
  })

  it('builds the body set_sentence reads', () => {
    const body = savePayload({ entry: sent('L1', '2026-11-20', word('a', '朋友')), text: ' 朋友好。', sentenceId: 'id1', characterSet: 'traditional' })
    expect(body).toEqual({
      // The word's own date: set_sentence files the sentence under it.
      date: '2026-11-20',
      sentence_id: 'id1',
      sentence: '朋友好。',
      list_id: 'L1',
      character_set: 'traditional',
      word: storedWord(word('a', '朋友'))
    })
    expect(savePayload({ entry: sent('L1', 'd', word('a', 'x')), text: 'x', sentenceId: 'i', characterSet: 'nonsense' }).character_set).toBe('simplified')
  })
})

describe('exampleLink', () => {
  it('sends HSK 1–3 words to YellowBridge, like the daily email', () => {
    expect(exampleLink({ hsk_level: '1' }, '朋友')).toBe('https://www.yellowbridge.com/chinese/sentsearch.php?word=%E6%9C%8B%E5%8F%8B')
    expect(exampleLink({ hsk_level: 3 }, '學習')).toBe('https://www.yellowbridge.com/chinese/sentsearch.php?word=%E5%AD%B8%E7%BF%92')
  })

  it('sends other levels to Baidu Translate', () => {
    expect(exampleLink({ hsk_level: '4' }, '环境')).toBe('https://fanyi.baidu.com/#zh/en/%E7%8E%AF%E5%A2%83')
    expect(exampleLink({}, '环境')).toBe('https://fanyi.baidu.com/#zh/en/%E7%8E%AF%E5%A2%83')
  })

  it('gives no link without a word', () => {
    expect(exampleLink({}, '')).toBeNull()
  })
})

describe('recentDays', () => {
  it('lists each day with words, newest first, skipping empty days', () => {
    const activity = {
      '2026-11-18': { review_words: [] },
      '2026-11-19': { review_words: [{ list_id: 'L', date_sent: '2026-11-19', word: { word_id: 'b' } }] },
      '2026-11-20': { review_words: [{ list_id: 'L', date_sent: '2026-11-20', word: { word_id: 'a' } }] }
    }
    expect(recentDays(activity).map((d) => [d.date, d.words.map((w) => w.word.word_id)]))
      .toEqual([['2026-11-20', ['a']], ['2026-11-19', ['b']]])
  })
})
