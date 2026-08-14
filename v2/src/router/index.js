import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Home is built; the remaining twelve routes are ported in Phase 4. Until then
// links to /quiz, /review and the signed-in screens fall through to the Vue 2
// app still serving those paths.
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    // The tokens and primitives page, kept for design review.
    path: '/styleguide',
    name: 'styleguide',
    component: () => import('../views/StyleguideView.vue')
  }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 })
})
