// The paths the Vue 2 app serves, taken from its src/router.js.
//
// Every one of these is linked from somewhere outside our control: old daily
// emails, sign-in links, bookmarks, search results. After cutover each must
// still resolve, so this list is the checklist for Phase 4 and
// tests/unit/routes.test.js enforces it:
//
//   - a path here must either be routed in ./index.js or be listed in
//     NOT_YET_PORTED below, never neither and never both;
//   - `npm run check:cutover` fails while NOT_YET_PORTED has anything in it.
//
// Porting a screen means adding its route and deleting its line below.

export const LEGACY_PATHS = [
  '/',
  '/quiz',
  '/review',
  '/history',
  '/signin',
  '/verification',
  '/profile',
  '/profile-settings',
  '/manage-lists',
  '/sentences',
  '/unsub',
  '/subscribed',
  '/my-quizzes'
]

export const NOT_YET_PORTED = [
  '/quiz',
  '/review',
  '/history',
  '/profile',
  '/profile-settings',
  '/manage-lists',
  '/sentences',
  '/unsub',
  '/subscribed',
  '/my-quizzes'
]
