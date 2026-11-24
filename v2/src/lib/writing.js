// Handwriting practice rules. The page (views/WriteView.vue) practises each
// character of today's words with Hanzi Writer; these helpers are the parts
// that don't need a browser.

const HAN = /\p{Script=Han}/u

/** The characters to practise for a word, in its set, Han only, repeats kept once. */
export function charactersOf (word = {}, traditional = false) {
  const text = (traditional ? (word.traditional || word.simplified) : word.simplified) ?? ''
  return [...new Set([...String(text)].filter((c) => HAN.test(c)))]
}

/** What POST /writing stores once every character of a word is done. */
export function writingPayload (entry, characterSet) {
  return {
    list_id: entry.list_id,
    word_id: entry.word?.word_id ?? '',
    characters: entry.word?.simplified ?? '',
    character_set: characterSet,
    date: entry.date_sent
  }
}

// Stroke data: Make Me a Hanzi via hanzi-writer-data (Arphic Public License),
// fetched per character from jsDelivr, pinned to one version. The service
// worker keeps what has been fetched (vite.config.js).
export const STROKE_DATA_VERSION = '2.0.1'
export const strokeDataUrl = (char) =>
  `https://cdn.jsdelivr.net/npm/hanzi-writer-data@${STROKE_DATA_VERSION}/${encodeURIComponent(char)}.json`
