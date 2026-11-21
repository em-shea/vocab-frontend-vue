<script setup>
import { useI18n } from 'vue-i18n'

// Marks a feature that is not built yet. Plain sentence-case text with a thin
// square outline: no uppercase, no tracking, no badge shape. `band` is for the
// dark band, where the text takes the on-dark colour.
defineProps({ band: { type: Boolean, default: false } })
const { t } = useI18n()
</script>

<template>
  <p class="soon" :class="{ 'soon--band': band }">{{ t('launchingSoon') }}</p>
</template>

<style scoped>
.soon {
  align-self: flex-start;
  padding: var(--s-1) var(--s-2);
  border: var(--bw-hair) solid var(--c-rule);
  font-size: var(--t-base);
  color: var(--c-muted);
}
.soon--band { border-color: var(--c-rule-gold); color: var(--c-on-dark); }
</style>
