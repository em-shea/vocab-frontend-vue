import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './locales'
import './assets/base.css'

const app = createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)

// Wait for the router's first navigation to resolve before mounting. Without
// this, route.query is still empty in the root component's onMounted, so a link
// carrying ?lang= or ?char= is silently ignored and the visitor gets stored
// defaults instead of the settings the link specified.
router.isReady().then(() => app.mount('#app'))
