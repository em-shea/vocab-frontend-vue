<script setup>
import { useI18n } from 'vue-i18n'

// The foot of every page: quiet, small text under a hairline, linking to the
// credits page. (The AI line was dropped 2026-11-27; the credits page still
// says where AI is used and where to report mistakes.)
const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <!-- Credits for prints, icons, stroke data, word lists and fonts live on
         their own page (Emily, 2026-11-23). -->
    <p class="site-footer__credit"><RouterLink :to="{ name: 'credits' }">{{ t('footerCredits') }}</RouterLink></p>
  </footer>
</template>

<style scoped>
.site-footer { display: flex; flex-direction: column; gap: var(--s-2); padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.site-footer__credit { font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-muted); overflow-wrap: anywhere; }
</style>
