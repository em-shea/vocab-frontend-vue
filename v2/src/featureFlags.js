// Feature flags for the site.
//
// HEROES_LAUNCHED switches the home page between its two versions:
//   false  the launch page: the daily word, levels, the daily email, quizzes and
//          review, and a "coming soon" band for the heroes.
//   true   the heroes page: the full walk-through with hero collection, quests,
//          and the not-yet-built features marked "Launching soon".
// Both versions are kept and tested. `/?home=heroes` and `/?home=launch` show
// one or the other regardless of this flag, for preview and for tests.
export const HEROES_LAUNCHED = false

// SENTENCES_ENABLED holds back practice sentences (/sentences), as the old
// app's flag of the same name does. The backend (GET and POST /sentences) is
// live, but the feature is not ready to announce.
//   false  /sentences still resolves, so old links do not 404, but it leads to
//          the profile (home until the profile is ported), as the old app did.
//   true   the screen itself: write sentences with today's words, and read back
//          the ones written before.
export const SENTENCES_ENABLED = false
