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

// SENTENCES_ENABLED switches practice sentences (/sentences and the profile's
// Sentences box). On since 2026-11-21 (Emily: include sentences at launch).
// Needs the set_sentence change that files a sentence under its word's date.
//   false  /sentences still resolves, so old links do not 404, but it leads to
//          the profile, as the old app did; the profile box is hidden.
//   true   write sentences for the last 10 days of words, and read back the
//          ones written before.
export const SENTENCES_ENABLED = true
