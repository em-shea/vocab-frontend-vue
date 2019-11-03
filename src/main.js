import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.component('v-select', VueSelect.VueSelect)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
