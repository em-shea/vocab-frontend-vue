<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import { useAuthStore } from '../stores/auth'

// Where the subscribe form leads once it has worked. Subscribing also emails a
// sign-in link (see SubscribeForm), so this says where to look for it.
//
// Old links to /subscribed open it too; with no sign-in on the way it simply
// reads in general terms.

const { t } = useI18n()
const auth = useAuthStore()
const sentTo = computed(() => auth.pendingEmail())
</script>

<template>
  <PageShell>
    <AppPanel>
      <h1 class="done__title">{{ t('subscribedTitle') }}</h1>
      <p v-if="sentTo">{{ t('subscribedSentTo', { email: sentTo }) }}</p>
      <p v-else>{{ t('subscribedSent') }}</p>
      <p>
        {{ t('subscribedExpiry') }}
        <RouterLink :to="{ name: 'signin' }">{{ t('subscribedNewLink') }}</RouterLink>
      </p>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.done__title { font-size: var(--t-xl); }
</style>
