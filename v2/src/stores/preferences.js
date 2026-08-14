import { defineStore } from 'pinia'
import i18n, { normalise } from '../locales'
import { api } from '../api/client'

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
      language: normalise(saved.language),
      // Set once the user record loads; until then preference changes stay local.
      signedIn: false
    }
  },

  getters: {
    isTraditional: (state) => state.characterSet === 'traditional',
    /** Picks the right field off a word record for the current character set. */
    renderWord: (state) => (word) =>
      state.characterSet === 'traditional' ? word?.traditional : word?.simplified
  },

  actions: {
    setCharacterSet (value, { sync = true } = {}) {
      this.characterSet = value === 'traditional' ? 'traditional' : 'simplified'
      this.persist()
      if (sync) this.syncToAccount()
    },

    setLanguage (value, { sync = true } = {}) {
      this.language = normalise(value)
      // The store is the single source of truth; vue-i18n follows it rather than
      // holding a second copy that could drift.
      i18n.global.locale.value = this.language
      this.persist()
      if (sync) this.syncToAccount()
    },

    toggleLanguage () {
      this.setLanguage(this.language === 'cn' ? 'en' : 'cn')
    },

    /** Applies the stored values on boot, before anything renders. */
    hydrate () {
      i18n.global.locale.value = this.language
    },

    /** Applies ?char= / ?lang= from a shared or emailed link. */
    applyFromQuery (query = {}) {
      if (query.char) this.setCharacterSet(query.char, { sync: false })
      if (query.lang) this.setLanguage(query.lang, { sync: false })
    },

    /** Both preferences as the API expects them. */
    accountPayload () {
      return {
        character_set_preference: this.characterSet,
        language_preference: this.language
      }
    },

    /**
     * Mirror the choice onto the user record so it follows them to another
     * device. Signed-out visitors keep localStorage only; a failure here must
     * not disturb the interface, which has already switched.
     */
    async syncToAccount () {
      if (!this.signedIn) return
      try {
        await api.updateUser(this.accountPayload())
      } catch (err) {
        console.warn('Could not save preferences to your account.', err)
      }
    },

    /** Adopt whatever the signed-in user's record holds. */
    adoptFromUser (user) {
      if (!user) return
      this.signedIn = true
      if (user['Character set preference'] || user.character_set_preference) {
        this.setCharacterSet(
          user['Character set preference'] ?? user.character_set_preference,
          { sync: false }
        )
      }
      if (user['Language preference'] || user.language_preference) {
        this.setLanguage(
          user['Language preference'] ?? user.language_preference,
          { sync: false }
        )
      }
    },

    persist () {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ characterSet: this.characterSet, language: this.language })
      )
    }
  }
})
