import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

var store = {
  state: {
    characterSet: 'simplified'
    // characterSet: 'traditional'
  },
  changeCharacterSet (newValue) {
    console.log('changeCharacterSet triggered with', newValue)
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
