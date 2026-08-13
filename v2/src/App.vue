<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePreferencesStore } from './stores/preferences'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const prefs = usePreferencesStore()
const auth = useAuthStore()

onMounted(async () => {
  // ?char= / ?lang= from an emailed or shared link wins over stored preferences.
  prefs.applyFromQuery(route.query)
  // Safe when signed out - resolves to false rather than throwing, which is why
  // there is no try/catch here.
  await auth.restore()
})
</script>

<template>
  <RouterView />
</template>
