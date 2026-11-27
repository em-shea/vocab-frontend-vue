import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { SENTENCES_ENABLED, WRITING_ENABLED } from '../featureFlags'

// Routes are ported from the Vue 2 app one at a time in Phase 4. What is still
// outstanding is listed in ./legacy.js, and a test holds this file to it.
export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('../views/QuizView.vue')
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('../views/ReviewView.vue')
  },
  {
    // The old site sent /history to /review. Daily emails from before that
    // change still link here, so the redirect has to outlive the old app.
    path: '/history',
    redirect: (to) => ({ name: 'review', query: to.query })
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignInView.vue')
  },
  {
    // The emailed sign-in link points here with ?code=…; see VerificationView.
    path: '/verification',
    name: 'verification',
    component: () => import('../views/VerificationView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/profile-settings',
    name: 'profile-settings',
    component: () => import('../views/ProfileSettingsView.vue')
  },
  {
    // The old site's /my-quizzes was an unfinished stub. Quiz history now
    // lives on the profile, so the path goes there, keeping ?lang= and ?char=.
    path: '/my-quizzes',
    redirect: (to) => ({ name: 'profile', query: to.query })
  },
  {
    // The tokens and primitives page, kept for design review.
    path: '/styleguide',
    name: 'styleguide',
    component: () => import('../views/StyleguideView.vue')
  },
  {
    // Internal preview of the collectible hero card in its three layouts.
    path: '/hero-card',
    name: 'hero-card',
    component: () => import('../views/HeroCardLabView.vue')
  },
  // --- lists, unsubscribe, subscribed ---
  {
    // Signed in: which lists and character sets the daily email carries.
    path: '/manage-lists',
    name: 'manage-lists',
    component: () => import('../views/ManageListsView.vue')
  },
  {
    // Every daily email links here with ?list=…&char=…&email=…; see UnsubscribeView.
    path: '/unsub',
    name: 'unsub',
    component: () => import('../views/UnsubscribeView.vue')
  },
  {
    // Where the subscribe form leads once it has worked.
    path: '/subscribed',
    name: 'subscribed',
    component: () => import('../views/SubscribedView.vue')
  },
  {
    // Practice sentences, held back by SENTENCES_ENABLED as in the old app.
    // Switched off, the path still resolves so old links never 404: it leads
    // to the profile, as the old app's did.
    path: '/sentences',
    name: 'sentences',
    ...(SENTENCES_ENABLED
      ? { component: () => import('../views/SentencesView.vue') }
      : { redirect: (to) => ({ path: '/profile', query: to.query }) })
  },
  {
    // Handwriting practice, behind WRITING_ENABLED like sentences.
    path: '/write',
    name: 'write',
    ...(WRITING_ENABLED
      ? { component: () => import('../views/WriteView.vue') }
      : { redirect: (to) => ({ path: '/profile', query: to.query }) })
  },
  {
    // Everything the site uses that someone else made (linked from the footer).
    path: '/credits',
    name: 'credits',
    component: () => import('../views/CreditsView.vue')
  },
  {
    // Opt-in public profile (switched on in profile settings). No sign-in.
    path: '/u/:handle',
    name: 'public-profile',
    component: () => import('../views/PublicProfileView.vue')
  },
  {
    // Join the early testers (vocab POST /testers). Open to read signed out.
    path: '/testers',
    name: 'testers',
    component: () => import('../views/TestersView.vue')
  },
  {
    // This week's ranking of public profiles. No sign-in.
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('../views/LeaderboardView.vue')
  }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 })
})
