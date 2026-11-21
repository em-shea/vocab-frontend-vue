<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

// One line across the top while the device has no connection. The installed
// app still opens offline, but words, quizzes and the profile come from the
// API, so this says why they will not load.

const { t } = useI18n()
const offline = ref(typeof navigator !== 'undefined' && navigator.onLine === false)
const update = () => { offline.value = navigator.onLine === false }

onMounted(() => {
  update()
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
})
</script>

<template>
  <p v-if="offline" class="offline" role="status">{{ t('offlineNotice') }}</p>
</template>

<style scoped>
.offline {
  margin: 0;
  padding: var(--s-2) var(--s-4);
  text-align: center;
  font-size: var(--t-base);
  color: var(--c-on-button);
  background-color: var(--c-button);
}
</style>
