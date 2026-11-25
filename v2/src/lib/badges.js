// Badges a public profile can show (vocab: public_profile_service.BADGES).
// Each is a seal with one character, in the order the backend returns them.
// Labels live in the locales as badge_<id>.
export const BADGE_GLYPHS = {
  founding_tester: '先',
  first_quiz: '考',
  first_sentence: '句',
  first_stroke_order: '笔',
  streak_7: '七',
  streak_30: '卅',
  streak_100: '百'
}

export const knownBadges = (ids = []) => ids.filter((id) => id in BADGE_GLYPHS)

/** The name a public profile shows, or null for "unnamed". */
export const publicName = (entry) => entry?.name || null
