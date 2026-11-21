<script setup>
import { useI18n } from 'vue-i18n'

// Account links: rarely used, so plain text links rather than buttons. Beside
// the name on a wide screen, at the foot of the page on a phone.
const emit = defineEmits(['sign-out'])
const { t } = useI18n()
</script>

<template>
  <nav class="actions" :aria-label="t('profileAccount')">
    <RouterLink :to="{ name: 'profile-settings' }">{{ t('profileSettings') }}</RouterLink>
    <RouterLink to="/manage-lists">{{ t('profileManageLists') }}</RouterLink>
    <button type="button" class="actions__sign-out" @click="emit('sign-out')">{{ t('profileSignOut') }}</button>
  </nav>
</template>

<style scoped>
.actions { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-6); font-size: var(--t-base); }
.actions a { color: var(--c-ink); }
.actions__sign-out {
  padding: 0;
  font: inherit;
  color: var(--c-ink);
  background: none;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.actions__sign-out:focus-visible { outline: 2px solid var(--c-red); outline-offset: 3px; }
</style>
