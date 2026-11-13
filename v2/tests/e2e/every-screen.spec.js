import { test, expect } from '@playwright/test'
import { mockBackend, watchForErrors, overflowsSideways } from './support/backend'

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
  { name: 'sign in', path: '/signin' },
  { name: 'review', path: '/review' },
  {
    name: 'check your email',
    path: '/verification',
    // Only reachable with a sign-in in progress.
    before: (page) => page.addInitScript(() =>
      window.localStorage.setItem('localSessionData', JSON.stringify({ username: 'learner@example.com', session: 's' })))
  }
]

for (const screen of SCREENS) {
  for (const lang of ['en', 'cn']) {
    test(`${screen.name} (${lang}) renders cleanly`, async ({ page }) => {
      const backend = await mockBackend(page)
      const problems = watchForErrors(page)
      await screen.before?.(page)

      await page.goto(`${screen.path}?lang=${lang}`)
      await expect(page.getByRole('heading').first()).toBeVisible()
      await page.evaluate(() => document.fonts.ready)

      // vue-i18n renders the key itself when a translation is missing. Keys are
      // camelCase with no spaces; real copy in either language is not.
      const text = await page.locator('body').innerText()
      expect(text.match(/\b(signIn|verify|review|nav|quest|story|faq)[A-Z]\w+\b/g) ?? []).toEqual([])

      expect(await overflowsSideways(page), 'page scrolls sideways').toBe(false)
      expect(problems).toEqual([])
      expect(backend.unexpected).toEqual([])
    })
  }
}
