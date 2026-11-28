<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// The foot of every page: quiet, small text under a hairline, linking to the
// feedback form (signed in only) and the credits page. (The AI line was dropped 2026-11-27; the credits page still
// says where AI is used and where to report mistakes.)
const { t } = useI18n()
const route = useRoute()
// Only for signed-in learners, so we know who to reply to.
const auth = useAuthStore()
</script>

<template>
  <footer class="site-footer">
    <!-- Credits for prints, icons, stroke data, word lists and fonts live on
         their own page (Emily, 2026-11-23). -->
    <p class="site-footer__links">
      <RouterLink v-if="auth.signedIn" :to="{ name: 'feedback', query: { from: route.path } }">{{ t('footerFeedback') }}</RouterLink>
      <RouterLink :to="{ name: 'credits' }">{{ t('footerCredits') }}</RouterLink>
    </p>
  </footer>
</template>

<style scoped>
.site-footer { display: flex; flex-direction: column; gap: var(--s-2); padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.site-footer__links { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-4); margin: 0; font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-muted); overflow-wrap: anywhere; }
</style>
