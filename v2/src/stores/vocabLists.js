import { defineStore } from 'pinia'
import { api } from '../api/client'

// The vocab lists and their sample words.
//
// GET /sample_vocab returns { <list_id>: [ {word_id, word}, ... ] } — five
// random words per list, and only public lists since it backs the anonymous
// home page. It does not carry list names, so those are paired up from the
// known HSK ordering; once the list metadata endpoint from Phase 0 is exposed
// this can read names from the API instead.

const HSK_NAMES = {
  '1ebcad3f-5dfd-6bfe-bda4-acde48001122': { level: 1, name: 'HSK Level 1' },
  '1ebcad3f-adc0-6f42-b8b1-acde48001122': { level: 2, name: 'HSK Level 2' },
  '1ebcad3f-f815-6b92-b3e8-acde48001122': { level: 3, name: 'HSK Level 3' },
  '1ebcad40-414f-6bc8-859d-acde48001122': { level: 4, name: 'HSK Level 4' },
  '1ebcad40-bb9e-6ece-a366-acde48001122': { level: 5, name: 'HSK Level 5' },
  '1ebcad41-197a-6700-95a3-acde48001122': { level: 6, name: 'HSK Level 6' }
}

export const useVocabListsStore = defineStore('vocabLists', {
  state: () => ({
    lists: [],
    samples: {},
    loading: false,
    error: null
  }),

  getters: {
    all: (state) => state.lists,
    byId: (state) => (id) => state.lists.find((l) => l.list_id === id) ?? null,
    samplesFor: (state) => (id) => state.samples[id] ?? []
  },

  actions: {
    async load () {
      if (this.lists.length || this.loading) return
      this.loading = true
      this.error = null
      try {
        const { data } = await api.sampleVocab()
        this.samples = data
        this.lists = Object.keys(data)
          .map((id) => ({
            list_id: id,
            list_name: HSK_NAMES[id]?.name ?? 'Vocab list',
            level: HSK_NAMES[id]?.level ?? 99
          }))
          .sort((a, b) => a.level - b.level)
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    }
  }
})
