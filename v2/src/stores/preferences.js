import { defineStore } from 'pinia'

// Character set and UI language.
//
// Two separate axes, deliberately: character set is how *study content* renders
// (simplified vs traditional), language is what the *interface* is written in.
// The Vue 2 app kept character set in a hand-rolled store on the root component
// and read it as $root.$data.store.state.characterSet from five files, and it
// reset on every reload. Persisting it here fixes that.
//
// Phase 2 wires `language` to vue-i18n and syncs both to the user record via
// POST /update_user for signed-in users.

const STORAGE_KEY = 'hhtt.preferences'

function load () {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export const usePreferencesStore = defineStore('preferences', {
  state: () => {
    const saved = load()
    return {
      characterSet: saved.characterSet === 'traditional' ? 'traditional' : 'simplified',
      language: saved.language === 'cn' ? 'cn' : 'en'
    }
  },

  getters: {
    isTraditional: (state) => state.characterSet === 'traditional',
    /** Picks the right field off a word record for the current character set. */
    renderWord: (state) => (word) =>
      state.characterSet === 'traditional' ? word?.traditional : word?.simplified
  },

  actions: {
    setCharacterSet (value) {
      this.characterSet = value === 'traditional' ? 'traditional' : 'simplified'
      this.persist()
    },

    setLanguage (value) {
      this.language = value === 'cn' ? 'cn' : 'en'
      this.persist()
    },

    /** Applies ?char= / ?lang= from a shared or emailed link. */
    applyFromQuery (query) {
      if (query.char) this.setCharacterSet(query.char)
      if (query.lang) this.setLanguage(query.lang)
    },

    persist () {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ characterSet: this.characterSet, language: this.language })
      )
    }
  }
})
