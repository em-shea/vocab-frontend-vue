import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'open-iconic/font/css/open-iconic-bootstrap.css'
import VTooltip from 'v-tooltip'

import Amplify from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: process.env.VUE_APP_REGION,
    userPoolId: process.env.VUE_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID
  }
  // Auth: {
  //   region: 'us-east-1',
  //   userPoolId: 'us-east-1_5Ivj5CJ6z',
  //   userPoolWebClientId: 'mi4ig9h25fg7v9dvmlk6mgodd'
  // }
})

Vue.use(VTooltip)

Vue.config.productionTip = false

var store = {
  state: {
    characterSet: 'simplified'
  },
  changeCharacterSet (newValue) {
    this.state.characterSet = newValue
  },
  updateSignInStatus (newValue) {
    let signedIn = newValue
    localStorage.setItem('signInStatus', signedIn)
  },
  retrieveSignInStatus () {
    if (localStorage.getItem('signInStatus')) {
      // console.log('sign in status stored')
      return JSON.parse(localStorage.getItem('signInStatus'))
    }
    return false
  },
  storeSessionData (username, session) {
  // storeSessionData (cognitoUser) {
    // let sessionData = JSON.stringify({ cognitoUser })
    let sessionData = JSON.stringify({
      'username': username,
      'session': session
    })
    localStorage.setItem('localSessionData', sessionData)
  },
  retrieveSessionData () {
    let sessionData = JSON.parse(localStorage.getItem('localSessionData'))
    return sessionData
  }
}

new Vue({
  data: {
    store: store
  },
  router,
  render: h => h(App)
}).$mount('#app')
