<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePreferencesStore } from './stores/preferences'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const prefs = usePreferencesStore()
const auth = useAuthStore()

// Apply stored preferences before first paint so the interface does not flash
// English and then switch.
prefs.hydrate()

onMounted(async () => {
  // ?char= / ?lang= from an emailed or shared link wins over stored values, so a
  // link can carry its own reading settings.
  prefs.applyFromQuery(route.query)

  // Safe when signed out — resolves false rather than throwing.
  const signedIn = await auth.restore()
  if (signedIn) {
    // The account record wins over localStorage, so preferences follow the user
    // between devices. Only after this do changes sync back.
    prefs.adoptFromUser(auth.user)
  }
})

// Keep the language in the URL so a copied link carries it.
watch(
  () => prefs.language,
  (lang) => {
    if (route.query.lang === lang) return
    router.replace({ query: { ...route.query, lang } })
  }
)
</script>

<template>
  <RouterView />
</template>
