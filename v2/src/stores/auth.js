import { defineStore } from 'pinia'
import { api } from '../api/client'
import { getSession, signOut as cognitoSignOut } from '../api/session'

// Replaces shared.js getSignedInUser / getUserData / signOut, which each rebuilt
// a Cognito pool object and returned bare promises that views handled
// inconsistently.

export const useAuthStore = defineStore('auth', {
  state: () => ({
    signedIn: false,
    user: null,      // the /user record: email, subscriptions, preferences
    loading: false,
    error: null
  }),

  getters: {
    subscriptions: (state) => state.user?.subscriptions ?? [],
    activeSubscriptions: (state) =>
      (state.user?.subscriptions ?? []).filter((s) => s.status === 'subscribed'),
    email: (state) => state.user?.email_address ?? null
  },

  actions: {
    /** Restores session state on app start. Safe to call when signed out. */
    async restore () {
      const session = await getSession()
      this.signedIn = Boolean(session)
      if (this.signedIn) {
        await this.loadUser()
      }
      return this.signedIn
    },

    async loadUser () {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.user()
        // The API wraps payloads as { success, message, data }.
        this.user = data?.data ?? data
      } catch (err) {
        this.error = err
        this.user = null
      } finally {
        this.loading = false
      }
    },

    signOut () {
      cognitoSignOut()
      this.signedIn = false
      this.user = null
    }
  }
})
