// Profile rules, kept apart from the screens so they can be tested on their own.
//
// Ported from the Vue 2 UserProfile.vue and EditUserInfo.vue. Behaviour is the
// same apart from the fixes marked FIX below.
//
// The user record comes from GET /user (settings) or GET /user_activity
// (profile), both built by vocab: layer/python/user_service.py. Unset text
// fields arrive as the literal string 'Not set', and that is also what the
// settings screen writes back to clear a name.

import NAMES from '../assets/profile-names.json'

export const NOT_SET = 'Not set'

/** The profile names on offer: 小 plus a surname, as the old screen had them. */
export const PROFILE_NAMES = NAMES

export const isSet = (value) => typeof value === 'string' && value.trim() !== '' && value !== NOT_SET

/** The learner's chosen name and its pinyin, or null when none is set. */
export function profileName (user) {
  if (!isSet(user?.user_alias)) return null
  return { name: user.user_alias, pinyin: isSet(user.user_alias_pinyin) ? user.user_alias_pinyin : '' }
}

/**
 * The name paired character by character with its pinyin, for <ruby>. Null
 * when they do not pair up one to one, so the caller shows them side by side.
 */
export function rubyPairs (name, pinyin) {
  const chars = [...(name ?? '')]
  const syllables = (pinyin ?? '').trim().split(/\s+/).filter(Boolean)
  if (!chars.length || chars.length !== syllables.length) return null
  return chars.map((char, i) => ({ char, pinyin: syllables[i] }))
}

/**
 * What POST /update_user expects to set or clear the name. Field names and the
 * 'Not set' convention match the old screen (vocab: set_user_data/app.py).
 * Only these two fields are sent: the endpoint updates whatever is present, so
 * the stored emoji and preferences are left as they are.
 */
export function namePayload (choice) {
  if (!choice || !isSet(choice.character)) {
    return { user_alias: NOT_SET, user_alias_pinyin: NOT_SET }
  }
  return {
    user_alias: choice.character,
    user_alias_pinyin: isSet(choice.pinyin) ? choice.pinyin : NOT_SET
  }
}

/**
 * The options for the name picker. FIX: the old picker only knew the fixed
 * list, so a stored name not on it showed as a blank choice. It is kept here,
 * first, so opening the settings never seems to have lost it.
 */
export function nameOptions (user, names = PROFILE_NAMES) {
  const current = profileName(user)
  if (!current || names.some((n) => n.character === current.name)) return names
  return [{ character: current.name, pinyin: current.pinyin }, ...names]
}

/**
 * The day the backend calls today. Lambda runs in UTC, and both the activity
 * keys and a saved quiz's date_created are UTC dates.
 */
export const todayKey = (now = new Date()) => now.toISOString().slice(0, 10)

/**
 * Today's saved quiz from the /user_activity record, or null.
 *
 * FIX: the old screen looked up activity[local date].quiz. Ahead of UTC (east
 * of Greenwich, early in the day) that key does not exist yet, and the lookup
 * threw, leaving the profile on its spinner.
 */
export const todaysQuiz = (activity, now = new Date()) => activity?.[todayKey(now)]?.quiz ?? null

/**
 * The newest word each subscribed list has been sent, in subscription order.
 *
 * The old screen fetched every list's words again from GET /review for this;
 * /user_activity already carries the last ten days for the lists the learner
 * takes, so it reads them from there. A list taken in both character sets is
 * shown once: the site-wide character setting decides how it renders.
 */
export function latestWords (activity = {}, subscriptions = []) {
  const days = Object.keys(activity ?? {}).sort().reverse()
  const latest = new Map()
  for (const day of days) {
    for (const entry of activity[day]?.review_words ?? []) {
      if (entry?.list_id && entry.word && !latest.has(entry.list_id)) latest.set(entry.list_id, entry)
    }
  }
  const seen = new Set()
  const words = []
  for (const sub of subscriptions ?? []) {
    if (seen.has(sub.list_id)) continue
    seen.add(sub.list_id)
    if (latest.has(sub.list_id)) words.push(latest.get(sub.list_id))
  }
  return words
}

/**
 * Saved quizzes from GET /quizzes, newest first. The API returns them oldest
 * first by key, so within a day the later quiz also comes first here.
 */
export function quizHistory (quizzes = []) {
  return [...(quizzes ?? [])]
    .filter((q) => q && q.date_created)
    .reverse()
    .sort((a, b) => (a.date_created < b.date_created ? 1 : a.date_created > b.date_created ? -1 : 0))
}

/** "80%", rounded; 0% for a quiz with no questions. */
export const scorePercent = ({ correct_answers: correct = 0, question_quantity: total = 0 } = {}) =>
  `${total ? Math.round((correct / total) * 100) : 0}%`

const wordId = (entry) => entry?.word?.word_id ?? entry?.word?.simplified

/**
 * Each of today's words comes with two things to do: a quiz on its list and a
 * sentence with the word. A quiz counts if one was saved for that list on or
 * after the day the word was sent; a sentence counts if one is filed with the
 * word on that day (either character-set copy).
 */
export function wordProgress (words = [], quizzes = [], activity = {}) {
  return words.map((entry) => ({
    entry,
    quiz: (quizzes ?? []).some((q) => q?.list_id === entry.list_id && String(q.date_created) >= String(entry.date_sent)),
    // The sentence itself (truthy), or null.
    sentence: (activity?.[entry.date_sent]?.review_words ?? []).find((e) =>
      e?.list_id === entry.list_id && wordId(e) === wordId(entry) && e.sentence?.sentence)?.sentence ?? null
  }))
}

/** How many of today's words have the given action done: { done, total }. */
export const progressCount = (progress = [], key) =>
  ({ done: progress.filter((p) => p[key]).length, total: progress.length })
