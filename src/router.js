import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Quiz from './views/Quiz.vue'
import History from './views/History.vue'
import Unsubscribe from './views/Unsubscribe.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: Quiz
    },
    {
      path: '/history',
      name: 'history',
      component: History
    },
    {
      path: '/unsub',
      name: 'unsub',
      component: Unsubscribe
    }
  ]
})
