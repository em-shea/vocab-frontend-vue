// Badges a public profile can show (vocab: public_profile_service.BADGES), in
// the order the backend returns them. Each face is a small square crop of a
// woodblock print (src/assets/prints/badges/README.md), a placeholder until
// PixelLab badge art exists. Labels live in the locales as badge_<id>.
import newUser from '../assets/prints/badges/new_user.jpg'
import firstQuiz from '../assets/prints/badges/first_quiz.jpg'
import firstSentence from '../assets/prints/badges/first_sentence.jpg'
import firstStrokeOrder from '../assets/prints/badges/first_stroke_order.jpg'

// Four badges (Emily, 2026-11-25). Why each was earned shows on hover/focus.
export const BADGE_ART = {
  new_user: newUser,
  first_quiz: firstQuiz,
  first_sentence: firstSentence,
  first_stroke_order: firstStrokeOrder
}

// Rarest first, for showing a few badges in little room (leaderboard rows).
export const BADGE_RARITY = [
  'first_stroke_order',
  'first_sentence',
  'first_quiz',
  'new_user'
]

export const rarestBadges = (ids = [], max = 5) =>
  BADGE_RARITY.filter((id) => ids.includes(id) && id in BADGE_ART).slice(0, max)

export const knownBadges = (ids = []) => ids.filter((id) => id in BADGE_ART)

/** The name a public profile shows, or null for "unnamed". */
export const publicName = (entry) => entry?.name || null
