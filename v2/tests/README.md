# Tests

Two layers, both run by `npm test` and by the `v2 checks` workflow on every
pull request that touches `v2/`.

## Unit tests (`tests/unit`, Vitest)

Fast checks on logic with no browser: `npm run test:unit`.

- `locales.test.js` — English and Chinese have the same keys, none empty, and
  every key a template asks for exists.
- `routes.test.js` — every path the old site served is either ported or listed
  as outstanding in `src/router/legacy.js`.
- `session.test.js`, `auth.store.test.js` — sign-in state.

## User-journey tests (`tests/e2e`, Playwright)

The real app in a real browser, at phone (390) and desktop (1120) widths:
`npm run test:e2e`. Cognito and the API are replaced by the stand-ins in
`tests/e2e/support/backend.js`, so nothing is emailed and no credentials are
needed. Any request to somewhere unexpected fails the test.

If Playwright's browser download is blocked, use an installed Chrome:
`PW_CHANNEL=chrome npm run test:e2e`.

- `every-screen.spec.js` — the baseline for every screen, in both languages:
  renders, no missing translations, no console errors, no sideways scroll.
- `home.spec.js`, `sign-in.spec.js` — journeys.

## When you port a screen

1. Add its route, and delete its line from `NOT_YET_PORTED` in
   `src/router/legacy.js`.
2. Add one line to `SCREENS` in `tests/e2e/every-screen.spec.js`.
3. Add a spec for what a person does on it, including what happens when it
   goes wrong.
4. Add any new API call to `tests/e2e/support/backend.js`.

## Before cutover

`npm run check:cutover` fails while any old path is still unported.

## What these do not cover

They run against stand-ins, so they cannot tell you that the real backend has
changed shape, that Cognito is misconfigured, or that an email arrives. Check
sign-in by hand on staging before cutover.
