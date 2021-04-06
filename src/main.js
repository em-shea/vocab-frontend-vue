import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'open-iconic/font/css/open-iconic-bootstrap.css'
import VTooltip from 'v-tooltip'

import Amplify from 'aws-amplify'

Amplify.configure({
  // Auth: {
  //   region: process.env.REGION,
  //   userPoolId: process.env.USER_POOL_ID,
  //   userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID
  // }
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_5Ivj5CJ6z',
    userPoolWebClientId: 'mi4ig9h25fg7v9dvmlk6mgodd'
  }
})

Vue.use(VTooltip)

Vue.config.productionTip = false

var store = {
  state: {
    characterSet: 'simplified',
    // characterSet: 'traditional',
    signedIn: false
  },
  changeCharacterSet (newValue) {
    // console.log('changeCharacterSet triggered with', newValue)
    this.state.characterSet = newValue
  }
}

new Vue({
  data: {
    store: store
  },
  router,
  render: h => h(App)
}).$mount('#app')
