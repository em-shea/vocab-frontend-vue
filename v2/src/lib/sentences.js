// Practice sentence rules, kept apart from the screen so they can be tested on
// their own.
//
// The Vue 2 UserSentences.vue was never finished: it posted a hard-coded mock
// sentence from a "test button" and read the list from the wrong place in the
// response. What the screen should do is taken from the backend instead:
//
//   GET /user_activity  (get_user_activity/app.py) the words each subscribed
//                       list sent over the past 10 days, keyed by date, newest
//                       first. A word carries `sentence` when one was written
//                       for it that day.
//   GET /sentences      (get_sentences/app.py) every sentence the person has
//                       written: { data: { sentences: [{ sentence_id, sentence,
//                       character_set, date_created }] } }.
//   POST /sentences     (set_sentence/app.py) saves one. The server stamps it
//                       with today's date and keys it on date + sentence_id, so
//                       saving again with the same id replaces it, and a
//                       sentence can only belong to the day it is written.
//
// That last rule is why only today's words can be written for: a sentence
// saved for an older word would be filed under today and never find its way
// back to that word.

export const MAX_LENGTH = 200
export const PAGE_SIZE = 10

/**
 * The server's today: the newest date in the activity. The server works in
 * UTC, so the visitor's own calendar can be a day either side of it.
 */
export function todayKey (activity = {}) {
  const dates = Object.keys(activity ?? {}).sort()
  return dates.length ? dates[dates.length - 1] : null
}

const wordKey = (entry) => `${entry?.list_id}|${entry?.word?.word_id ?? entry?.word?.simplified}`

/**
 * The words sent on one day, once each. Someone subscribed to one list in both
 * character sets is sent the same word twice; one sentence covers both.
 */
export function wordsOn (activity = {}, date) {
  if (!date) return []
  const seen = new Map()
  for (const entry of activity?.[date]?.review_words ?? []) {
    if (!entry?.word) continue
    const key = wordKey(entry)
    // Keep the copy that already has a sentence, if either does.
    if (!seen.has(key) || (!seen.get(key).sentence && entry.sentence)) seen.set(key, entry)
  }
  return [...seen.values()]
}

/**
 * The newest day's words, once each: the words on the profile's "Today's
 * words" card. The backend adds an empty entry for its (UTC) today before
 * that day's word is sent, so the newest date can have no words yet; this
 * skips to the newest day that has some, as the word card does.
 */
export const todaysWords = (activity = {}) => recentDays(activity)[0]?.words ?? []

/**
 * Every day in the activity (the last 10) that has words, newest first, each
 * with its words. Sentences can be written for any of them: set_sentence files
 * a sentence under the date sent with it (savePayload), so it pairs with its
 * word in /user_activity.
 */
export function recentDays (activity = {}) {
  return Object.keys(activity ?? {}).sort().reverse()
    .map((date) => ({ date, words: wordsOn(activity, date) }))
    .filter((day) => day.words.length > 0)
}

/** For each sentence written in the activity's 10 days, the word it was for. */
export function wordsBySentenceId (activity = {}) {
  const words = {}
  for (const day of Object.values(activity ?? {})) {
    for (const entry of day?.review_words ?? []) {
      const id = entry?.sentence?.sentence_id
      if (id) words[id] = entry.word
    }
  }
  return words
}

/** GET /sentences, unwrapped from { success, message, data }. */
export function sentencesFrom (body) {
  const list = body?.data?.sentences ?? body?.sentences ?? []
  return Array.isArray(list) ? list : []
}

/** GET /user_activity returns the user record unwrapped; allow for a wrapper. */
export function activityFrom (body) {
  if (body?.activity) return body.activity
  return body?.data?.activity ?? {}
}

/** Newest first. Ids break ties within a day only so the order is stable. */
export function newestFirst (sentences = []) {
  return [...sentences].sort((a, b) =>
    String(b.date_created).localeCompare(String(a.date_created)) ||
    String(b.sentence_id).localeCompare(String(a.sentence_id))
  )
}

/** Adds a sentence, or replaces the one with the same id, keeping the order. */
export function upsert (sentences = [], sentence) {
  return newestFirst([...sentences.filter((s) => s.sentence_id !== sentence.sentence_id), sentence])
}

/** What is worth saving: the text without stray space at either end. */
export const clean = (text) => String(text ?? '').trim()

/**
 * A new sentence's id. set_sentence makes one when sent an empty id, but does
 * not send it back, so a second save of the same sentence would file a
 * duplicate. Choosing the id here means a resave replaces instead.
 */
export function newSentenceId () {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * The word as set_sentence stores it. It is saved verbatim and read back by
 * review_word_service.format_word_body, which expects the word table's own
 * capitalised keys, not the lowercase ones the API hands out.
 */
export function storedWord (word = {}) {
  return {
    'Word id': word.word_id ?? '',
    Simplified: word.simplified ?? '',
    Traditional: word.traditional ?? '',
    Pinyin: word.pinyin ?? '',
    Definition: word.definition ?? '',
    'Audio file key': word.audio_file_key ?? '',
    'Difficulty level': word.difficulty_level ?? '',
    'HSK Level': word.hsk_level ?? ''
  }
}

/**
 * The POST /sentences body. `date` is the day the word was sent: set_sentence
 * files the sentence under it, and accepts today back to 30 days ago.
 */
export function savePayload ({ entry, text, sentenceId, characterSet }) {
  return {
    date: entry.date_sent,
    sentence_id: sentenceId,
    sentence: clean(text),
    list_id: entry.list_id,
    character_set: characterSet === 'traditional' ? 'traditional' : 'simplified',
    word: storedWord(entry.word)
  }
}
