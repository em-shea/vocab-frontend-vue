import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Quiz from './views/Quiz.vue'
import History from './views/History.vue'
import Unsubscribe from './views/Unsubscribe.vue'
import SignIn from './views/SignIn.vue'
import UserProfile from './views/UserProfile.vue'
import SignInAnswerChallenge from './views/SignInAnswerChallenge.vue'

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
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: UserProfile
    },
    {
      path: '/signin',
      name: 'sign-in',
      component: SignIn
    },
    {
      path: '/verification',
      name: 'answer-challenge',
      component: SignInAnswerChallenge
    }
  ]
})
