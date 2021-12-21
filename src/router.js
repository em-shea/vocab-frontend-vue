import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Quiz from './views/Quiz.vue'
import History from './views/History.vue'
import Unsubscribe from './views/Unsubscribe.vue'

import UserProfile from './views/UserProfile.vue'
import UserQuiz from './views/UserQuiz.vue'
import UserSentences from './views/UserSentences.vue'
import EditUserInfo from './views/EditUserInfo.vue'
import ManageLists from './views/ManageLists.vue'

import SignUpConfirmation from './views/SignUpConfirmation.vue'
import SignIn from './views/SignIn.vue'
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
      path: '/practice-sentences',
      name: 'user-sentences',
      component: UserSentences
    },
    {
      path: '/my-quizzes',
      name: 'user-quiz',
      component: UserQuiz
    },
    {
      path: '/subscribed',
      name: 'sign-up-confirmation',
      component: SignUpConfirmation
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
    },
    {
      path: '/profile-settings',
      name: 'edit-user-info',
      component: EditUserInfo
    },
    {
      path: '/manage-lists',
      name: 'manage-lists',
      component: ManageLists
    }
  ]
})
