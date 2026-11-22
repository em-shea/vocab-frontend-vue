import { ref, computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'

// Chinese definitions for immersion (中文) mode.
//
// The word records only carry CC-CEDICT's English definition. For the HSK
// lists, src/data/cn-definitions.json holds a short Chinese definition per
// word (written with a model from the English, 2026-11-21; see
// scripts/cn-definitions/README.md), and cn-definitions-trad.json the same in
// traditional characters. Keyed by characters and pinyin, plus the English
// definition where one word and reading appears twice with different senses.
//
// Each file is about 90 KB gzipped, so only the reader's character set is
// fetched, and only once they switch to 中文. Words it doesn't cover (e.g. a
// user's own list) keep the English.

const tables = { simplified: ref(null), traditional: ref(null) }
const loading = {}
const loaders = {
  simplified: () => import('../data/cn-definitions.json'),
  traditional: () => import('../data/cn-definitions-trad.json')
}

function load (set) {
  if (!loading[set]) {
    loading[set] = loaders[set]()
      .then((m) => { tables[set].value = m.default })
      .catch(() => { loading[set] = null })
  }
  return loading[set]
}

export const normalisePinyin = (p = '') => String(p).toLowerCase().trim().replace(/\s+/g, ' ')

/** The Chinese definition for a word, or '' if there is none. */
export function cnDefinitionFrom (data, word) {
  if (!data || !word) return ''
  const chars = word.simplified ?? word.Simplified ?? ''
  const pinyin = normalisePinyin(word.pinyin ?? word.Pinyin)
  const english = word.definition ?? word.Definition ?? ''
  return data[`${chars}|${pinyin}|${english}`] ?? data[`${chars}|${pinyin}`] ?? ''
}

/**
 * definitionOf(word): the Chinese definition in 中文 mode when there is one,
 * otherwise the word's English definition.
 */
export function useDefinition () {
  const prefs = usePreferencesStore()
  const immersed = computed(() => prefs.language === 'cn')
  return (word) => {
    const english = word?.definition ?? word?.Definition ?? ''
    if (!immersed.value) return english
    const set = prefs.isTraditional ? 'traditional' : 'simplified'
    if (!tables[set].value) { load(set); return english }
    return cnDefinitionFrom(tables[set].value, word) || english
  }
}
