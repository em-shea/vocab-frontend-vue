import { defineStore } from 'pinia'
import { api } from '../api/client'
import {
  getSession,
  startSignIn,
  answerSignInChallenge,
  loadPendingSignIn,
  signOut as cognitoSignOut
} from '../api/session'

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

    /** Emails a one-time sign-in link to this address. */
    async requestSignInLink (email) {
      await startSignIn(email.trim())
    },

    /** The address a sign-in link was last sent to, or null. */
    pendingEmail () {
      return loadPendingSignIn()?.username ?? null
    },

    /** Completes sign-in with the code from the emailed link. */
    async completeSignIn (code) {
      await answerSignInChallenge(code)
      this.signedIn = true
      await this.loadUser()
      // Recording the login is bookkeeping. If it fails the user is still
      // signed in, so it must never turn a successful sign-in into an error.
      api.updateLastLogin(null).catch(() => {})
    },

    signOut () {
      cognitoSignOut()
      this.signedIn = false
      this.user = null
    }
  }
})
