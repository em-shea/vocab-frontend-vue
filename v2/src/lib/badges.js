// Badges a public profile can show (vocab: public_profile_service.BADGES), in
// the order the backend returns them. Each face is a small square crop of a
// woodblock print (src/assets/prints/badges/README.md), a placeholder until
// PixelLab badge art exists. Labels live in the locales as badge_<id>.
import foundingTester from '../assets/prints/badges/founding_tester.jpg'
import firstQuiz from '../assets/prints/badges/first_quiz.jpg'
import firstSentence from '../assets/prints/badges/first_sentence.jpg'
import firstStrokeOrder from '../assets/prints/badges/first_stroke_order.jpg'
import streak7 from '../assets/prints/badges/streak_7.jpg'
import streak30 from '../assets/prints/badges/streak_30.jpg'
import streak100 from '../assets/prints/badges/streak_100.jpg'

export const BADGE_ART = {
  founding_tester: foundingTester,
  first_quiz: firstQuiz,
  first_sentence: firstSentence,
  first_stroke_order: firstStrokeOrder,
  streak_7: streak7,
  streak_30: streak30,
  streak_100: streak100
}

// Rarest first, for showing a few badges in little room (leaderboard rows).
export const BADGE_RARITY = [
  'streak_100',
  'streak_30',
  'founding_tester',
  'streak_7',
  'first_stroke_order',
  'first_sentence',
  'first_quiz'
]

export const rarestBadges = (ids = [], max = 5) =>
  BADGE_RARITY.filter((id) => ids.includes(id) && id in BADGE_ART).slice(0, max)

export const knownBadges = (ids = []) => ids.filter((id) => id in BADGE_ART)

/** The name a public profile shows, or null for "unnamed". */
export const publicName = (entry) => entry?.name || null
