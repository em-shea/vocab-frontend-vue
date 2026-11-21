// Vocab list subscriptions: which lists a subscriber gets, and in which
// character set. Shared by /manage-lists and /unsub, kept apart from the
// screens so the rules can be tested on their own.
//
// A subscription is one list in one character set. The backend keys it as
// LIST#<list_id>#<SIMPLIFIED|TRADITIONAL> and calls that the unique list id, so
// HSK 1 in simplified and HSK 1 in traditional are two separate subscriptions.
//
// The six HSK lists are written out here, as the Vue 2 app did with
// assets/vocabListIds.json. No public endpoint returns list metadata yet, and
// the unsubscribe screen must work even when the API is struggling.

export const CHARACTER_SETS = ['simplified', 'traditional']

export const HSK_LISTS = [
  { list_id: '1ebcad3f-5dfd-6bfe-bda4-acde48001122', list_name: 'HSK Level 1' },
  { list_id: '1ebcad3f-adc0-6f42-b8b1-acde48001122', list_name: 'HSK Level 2' },
  { list_id: '1ebcad3f-f815-6b92-b3e8-acde48001122', list_name: 'HSK Level 3' },
  { list_id: '1ebcad40-414f-6bc8-859d-acde48001122', list_name: 'HSK Level 4' },
  { list_id: '1ebcad40-bb9e-6ece-a366-acde48001122', list_name: 'HSK Level 5' },
  { list_id: '1ebcad41-197a-6700-95a3-acde48001122', list_name: 'HSK Level 6' }
]

/** 'simplified' or 'traditional', or null for anything else. */
export function characterSet (value) {
  const lower = typeof value === 'string' ? value.toLowerCase() : ''
  return CHARACTER_SETS.includes(lower) ? lower : null
}

/** The backend's id for one list in one character set: <list_id>#SIMPLIFIED. */
export const uniqueId = ({ list_id: listId, character_set: set }) => `${listId}#${String(set).toUpperCase()}`

/**
 * Every list in every character set. The reader's own character set comes
 * first, so the lists they most likely want are at the top.
 */
export function catalogue (lists = HSK_LISTS, preferred = 'simplified') {
  const sets = [preferred, ...CHARACTER_SETS.filter((s) => s !== preferred)]
  return sets.flatMap((set) => lists.map((list) => entry(list, set)))
}

function entry (list, set) {
  const item = { list_id: list.list_id, list_name: list.list_name, character_set: set }
  return { ...item, unique_list_id: uniqueId(item) }
}

/** Active subscriptions from a GET /user record, each with its unique id. */
export function subscribed (user) {
  return (user?.subscriptions ?? [])
    .filter((s) => !s.status || s.status === 'subscribed')
    .map((s) => ({ ...s, character_set: characterSet(s.character_set) ?? s.character_set, unique_list_id: uniqueId(s) }))
}

/** Catalogue entries the reader is not already subscribed to. */
export function available (all, current) {
  const taken = new Set(current.map(uniqueId))
  return all.filter((list) => !taken.has(uniqueId(list)))
}

export function adding (current, list) {
  if (current.some((s) => uniqueId(s) === uniqueId(list))) return current
  return [...current, { ...entry(list, list.character_set), status: 'subscribed' }]
}

export function removing (current, list) {
  return current.filter((s) => uniqueId(s) !== uniqueId(list))
}

/**
 * The body for POST /subscriptions. The handler (vocab:
 * update_subscriptions/app.py) makes the account match this list exactly,
 * reading list_id, list_name and character_set from each entry.
 */
export const subscriptionsPayload = (subs) =>
  subs.map((s) => ({ list_id: s.list_id, list_name: s.list_name, character_set: s.character_set }))

// --- /unsub ------------------------------------------------------------------

const first = (value) => (Array.isArray(value) ? value[0] : value)
const text = (value) => (typeof first(value) === 'string' ? first(value) : '')

/**
 * Reads the daily email's unsubscribe link:
 *
 *   /unsub?list=<list_id>&char=<simplified|traditional>&email=<address>
 *
 * built by vocab: send_daily_email/app.py from the reader's first
 * subscription. Returns the address and the list to preselect.
 *
 * FIX: when the list in the link was not one of the HSK lists, the Vue 2
 * screen selected nothing and then sent list: '', which the backend reads as
 * "unsubscribe from everything". A list it does not know by name is now kept
 * as an option of its own, so the reader leaves only that list.
 */
export function readUnsubLink (query = {}, lists = HSK_LISTS) {
  const email = text(query.email).trim()
  const listId = text(query.list).trim()
  const set = characterSet(text(query.char))
  if (!listId || !set) return { email, list: null }

  const known = lists.find((l) => l.list_id === listId)
  return { email, list: entry(known ?? { list_id: listId, list_name: null }, set) }
}

/** Deliberately loose; the backend looks the address up in Cognito anyway. */
export const looksLikeEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value ?? '').trim())

/**
 * The body for POST /unsub (vocab: unsubscribe/app.py). cognito_id is empty
 * so the handler looks the address up; list '' means every list.
 */
export function unsubPayload ({ email, list, all }) {
  // Never fall back to '' by accident: that would leave every list.
  if (!all && !list) throw new Error('No list chosen.')
  return {
    cognito_id: '',
    email: email.trim(),
    list: all
      ? ''
      : { list_id: list.list_id, list_name: list.list_name ?? 'Vocab list', character_set: list.character_set }
  }
}
