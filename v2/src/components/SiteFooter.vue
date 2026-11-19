<script setup>
import { useI18n } from 'vue-i18n'

// The foot of a page: quiet, small text under a hairline. It carries the
// woodblock print credit once, so the prints themselves carry no captions.
const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <p class="site-footer__credit">{{ t('footerPrints') }}</p>
  </footer>
</template>

<style scoped>
.site-footer { padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.site-footer__credit { font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-muted); overflow-wrap: anywhere; }
</style>
