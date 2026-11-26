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

// WRITING_ENABLED switches digital handwriting practice (/write, the Writing
// task on the profile's word cards and its nav link). Added 2026-11-22 (Emily).
// Needs the backend's POST /writing and the "written" flag on activity words.
//   false  /write leads to the profile.
//   true   practise writing each character of today's words, stroke by stroke.
export const WRITING_ENABLED = true

// Last week's top 3 on the leaderboard on Mondays. Built 2026-11-25; on hold
// (Emily, 2026-11-25). The API already returns last_week.
export const LAST_WEEK_TOP3 = false
