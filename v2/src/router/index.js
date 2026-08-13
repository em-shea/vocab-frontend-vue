import { createRouter, createWebHistory } from 'vue-router'
import StyleguideView from '../views/StyleguideView.vue'

// Only the styleguide exists so far. Phases 3 and 4 add the home page and port
// the remaining thirteen routes from the Vue 2 app.
const routes = [
  {
    path: '/',
    name: 'styleguide',
    component: StyleguideView
  }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})
