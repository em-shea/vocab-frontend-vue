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
