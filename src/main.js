import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'open-iconic/font/css/open-iconic-bootstrap.css'
import VTooltip from 'v-tooltip'

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
