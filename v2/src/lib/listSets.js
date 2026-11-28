// Which character set each subscribed list is taken in (simplified, traditional
// or both), shared by every page that shows today's words.
//
// - A word follows its list's character set when the list is taken in one set;
//   a list taken in both follows the globe menu (Emily, 2026-11-22).
// - When someone's lists span both sets, each list name says which it is in:
//   "HSK Level 1 简", "HSK Level 3 繁", or "简 繁" for a list taken in both.
//   With only one set in use, names stay plain (Emily, 2026-11-22).

export const SET_MARK = { simplified: '简', traditional: '繁' }

/** The sets a list is subscribed in, simplified first. */
export const setsOf = (subscriptions, listId) => ['simplified', 'traditional']
  .filter((set) => (subscriptions ?? []).some((s) => s.list_id === listId && s.character_set === set))

/** True when the subscriptions use both character sets. */
export const usesBothSets = (subscriptions) =>
  new Set((subscriptions ?? []).map((s) => s.character_set).filter((set) => SET_MARK[set])).size > 1

/** The list's one set, or '' for a list taken in both (or not found). */
export const setFor = (subscriptions, listId) => {
  const sets = setsOf(subscriptions, listId)
  return sets.length === 1 ? sets[0] : ''
}

/** Whether to show traditional characters for a word from this list. */
export const isTraditionalFor = (subscriptions, listId, fallbackTraditional) => {
  const set = setFor(subscriptions, listId)
  return set ? set === 'traditional' : Boolean(fallbackTraditional)
}

/** The list name with 简 / 繁 after it, when the lists span both sets. */
export const withSetMarks = (subscriptions, listId, name) => {
  if (!usesBothSets(subscriptions)) return name
  const marks = setsOf(subscriptions, listId).map((set) => SET_MARK[set]).join(' ')
  return marks ? `${name} ${marks}` : name
}

/** A word's characters in the chosen set, falling back to simplified. */
export const wordCharacters = (word, traditional) =>
  (traditional ? word?.traditional : word?.simplified) || word?.simplified || ''
