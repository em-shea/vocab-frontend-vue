import { test, expect } from '@playwright/test'
import { mockBackend, watchForErrors, overflowsSideways, QUIZ_REVIEW, signedIn, sentencesSwitchedOn } from './support/backend'

// The baseline every screen must meet, in both languages, on a phone and on a
// desktop (the two projects in playwright.config.js):
//
//   - it renders a heading rather than a blank page;
//   - no interface text is a raw translation key;
//   - nothing errors in the console;
//   - it does not scroll sideways;
//   - it makes no request we did not expect.
//
// ADD A LINE HERE WHEN A SCREEN IS PORTED. That one line buys all of the above.

const SCREENS = [
  { name: 'home', path: '/' },
  { name: 'home (heroes version)', path: '/?home=heroes' },
  { name: 'sign in', path: '/signin' },
  { name: 'review', path: '/review' },
  { name: 'quiz', path: '/quiz', backend: { review: QUIZ_REVIEW } },
  { name: 'hero card lab', path: '/hero-card' },
  { name: 'sentences (switched off)', path: '/sentences' },
  { name: 'sentences', path: '/sentences', before: async (page) => { await signedIn(page); await sentencesSwitchedOn(page) } },
  {
    name: 'check your email',
    path: '/verification',
    // Only reachable with a sign-in in progress.
    before: (page) => page.addInitScript(() =>
      window.localStorage.setItem('localSessionData', JSON.stringify({ username: 'learner@example.com', session: 's' })))
  },
  // Profile screens: signed in, so they show themselves rather than sign-in.
  { name: 'profile', path: '/profile', before: async (page) => (await import('./support/backend')).signedIn(page) },
  { name: 'profile settings', path: '/profile-settings', before: async (page) => (await import('./support/backend')).signedIn(page) },
  // --- lists, unsubscribe, subscribed ---
  { name: 'manage lists', path: '/manage-lists', before: async (page) => (await import('./support/backend')).signedIn(page) },
  { name: 'manage lists, signed out', path: '/manage-lists' },
  { name: 'unsubscribe from an email link', path: '/unsub?list=1ebcad3f-adc0-6f42-b8b1-acde48001122&char=simplified&email=learner%40example.com' },
  { name: 'subscribed', path: '/subscribed' },
  { name: 'credits', path: '/credits' },
  { name: 'leaderboard', path: '/leaderboard' },
  { name: 'public profile', path: '/u/k7mq2xpa' },
  { name: 'handwriting practice', path: '/write', before: async (page) => (await import('./support/backend')).signedIn(page) }
]

for (const screen of SCREENS) {
  for (const lang of ['en', 'cn']) {
    test(`${screen.name} (${lang}) renders cleanly`, async ({ page }) => {
      const backend = await mockBackend(page, screen.backend)
      const problems = watchForErrors(page)
      await screen.before?.(page)

      // A path may already carry a query string.
      await page.goto(`${screen.path}${screen.path.includes('?') ? '&' : '?'}lang=${lang}`)
      await expect(page.getByRole('heading').first()).toBeVisible()
      await page.evaluate(() => document.fonts.ready)

      // vue-i18n renders the key itself when a translation is missing. Keys are
      // camelCase with no spaces; real copy in either language is not.
      const text = await page.locator('body').innerText()
      expect(text.match(/\b(signIn|verify|review|quiz|profile|lists|unsub|subscribed|sentences|write|credits|public|leaderboard|badge|nav|quest|story|faq)[A-Z]\w+\b/g) ?? []).toEqual([])

      expect(await overflowsSideways(page), 'page scrolls sideways').toBe(false)
      expect(problems).toEqual([])
      expect(backend.unexpected).toEqual([])
    })
  }
}
