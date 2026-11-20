import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
  }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 })
})
