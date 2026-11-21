// Quiz rules, kept apart from the screen so they can be tested on their own.
//
// Ported from the Vue 2 Quiz.vue, which held all of this in one 945-line
// component. Behaviour is the same apart from two fixes, marked FIX below.
//
// A quiz is built from the words a list was sent over the last 7, 14 or 30
// days (GET /review). Each question shows one field of a word (its characters,
// pinyin or definition) and asks for another field of the same word, out of
// four options.

export const RANGES = [7, 14, 30]
export const LENGTHS = [5, 10, 20]
export const DEFAULTS = { range: 30, length: 10 }
export const OPTIONS_PER_QUESTION = 4

// The fields a question can ask about. 'characters' resolves to simplified or
// traditional at render time, so switching character set needs no rebuild.
// Saved results record the concrete field, as the old app did.
const ALWAYS = [
  { question: 'characters', answers: 'definition' },
  { question: 'definition', answers: 'characters' },
  { question: 'definition', answers: 'pinyin' },
  { question: 'pinyin', answers: 'definition' }
]

// Characters ↔ pinyin only works when every option has the same number of
// characters; otherwise a one-syllable answer to a two-character question
// gives itself away.
const SAME_LENGTH_ONLY = [
  { question: 'characters', answers: 'pinyin' },
  { question: 'pinyin', answers: 'characters' }
]

/** Fisher–Yates on a copy. `random` is injectable so tests are repeatable. */
export function shuffle (items, random = Math.random) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * The words to quiz on: one entry per word, in the order the API gives.
 * A word can be sent twice in a range; the old app kept the last copy.
 */
export function uniqueWords (entries = []) {
  const byId = new Map()
  for (const entry of entries) {
    const id = entry?.word?.word_id ?? entry?.word?.simplified
    if (id != null) byId.set(id, entry)
  }
  return [...byId.values()]
}

/** True when the list has enough words to ask anything at all. */
export const canQuiz = (entries) => uniqueWords(entries).length >= OPTIONS_PER_QUESTION

/** The text a field shows for a word, in the reader's character set. */
export function fieldText (entry, field, characterSet = 'simplified') {
  const word = entry?.word ?? {}
  if (field === 'characters') {
    return characterSet === 'traditional' ? (word.traditional || word.simplified || '') : (word.simplified || '')
  }
  return word[field] ?? ''
}

// Pools of words that can share a question: one-character words, two-character
// words, and everything. FIX: the old loop spliced while iterating, so when two
// pools were too small it kept one of them and could build a question with
// fewer than four options.
function pools (words) {
  const length = (e) => [...(e.word?.simplified ?? '')].length
  return [
    { words: words.filter((e) => length(e) === 1), sameLength: true },
    { words: words.filter((e) => length(e) === 2), sameLength: true },
    { words, sameLength: false }
  ].filter((pool) => pool.words.length >= OPTIONS_PER_QUESTION)
}

/**
 * Builds one question.
 *
 * @param {object[]} words   unique word entries, at least four
 * @param {object}   [opts]
 * @param {object}   [opts.previous]  the last question's answer, not repeated back to back
 * @param {string}   [opts.characterSet]
 * @param {Function} [opts.random]
 * @returns {{ answer, options, type } | null}
 */
export function makeQuestion (words, { previous = null, characterSet = 'simplified', random = Math.random } = {}) {
  const available = pools(words)
  if (!available.length) return null

  // Pick a pool, then a question type that suits it, at random, as before.
  const pool = available[Math.floor(random() * available.length)]
  const types = pool.sameLength ? [...ALWAYS, ...SAME_LENGTH_ONLY] : ALWAYS
  const type = types[Math.floor(random() * types.length)]

  // If that pairing cannot make four distinct options, try every other one.
  const fallbacks = available.flatMap((p) =>
    (p.sameLength ? [...ALWAYS, ...SAME_LENGTH_ONLY] : ALWAYS).map((t) => [p, t]))
  for (const [p, t] of [[pool, type], ...fallbacks]) {
    const question = build(p.words, t, { previous, characterSet, random })
    if (question) return question
  }
  return null
}

function build (poolWords, type, { previous, characterSet, random }) {
  const candidates = shuffle(poolWords, random)
  // Not the same word twice in a row, when there is any other choice.
  if (previous && candidates[0] === previous) {
    ;[candidates[0], candidates[1]] = [candidates[1], candidates[0]]
  }
  const answer = candidates[0]

  // FIX: two words can share a pinyin or a definition (是 and 系 are both
  // "to be"). The old app could offer both, so a right choice could be marked
  // wrong. A distractor must not match the prompt, and must read differently
  // from the answer and from the other options.
  const prompt = fieldText(answer, type.question, characterSet)
  const shown = new Set([fieldText(answer, type.answers, characterSet)])
  const distractors = []
  for (const entry of candidates.slice(1)) {
    const text = fieldText(entry, type.answers, characterSet)
    if (!text || shown.has(text)) continue
    if (fieldText(entry, type.question, characterSet) === prompt) continue
    shown.add(text)
    distractors.push(entry)
    if (distractors.length === OPTIONS_PER_QUESTION - 1) break
  }
  if (distractors.length < OPTIONS_PER_QUESTION - 1) return null

  return { answer, options: shuffle([answer, ...distractors], random), type }
}

/** "70%", rounded, as the old results screen showed it. */
export const percent = (correct, total) => `${total ? Math.round((correct / total) * 100) : 0}%`

/**
 * What POST /quizzes expects. Field names and shapes match the Vue 2 app so
 * stored quizzes stay readable by GET /quizzes (vocab: set_quiz_results/app.py,
 * models.Quiz). `test_set` stores the concrete character field.
 */
export function resultsPayload ({ listId, characterSet, range, length, answers }) {
  const concrete = (field) => (field === 'characters' ? characterSet : field)
  return {
    list_id: listId,
    character_set: characterSet,
    date_range: range,
    question_quantity: length,
    correct_answers: answers.filter((a) => a.correct).length,
    quiz_data: answers.map((a) => ({
      correct_answer: a.answer,
      answer_submitted: a.chosen,
      was_answer_correct: a.correct,
      test_set: { question: concrete(a.type.question), answers: concrete(a.type.answers) }
    }))
  }
}
