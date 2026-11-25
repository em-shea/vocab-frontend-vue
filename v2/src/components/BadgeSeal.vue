<script setup>
import { useI18n } from 'vue-i18n'
import { BADGE_ART } from '../lib/badges'

// One badge: a square crop of a woodblock print, its name beneath.
defineProps({
  id: { type: String, required: true },
  small: { type: Boolean, default: false }
})
const { t } = useI18n()
</script>

<template>
  <span class="badge" :class="{ 'badge--small': small }">
    <img class="badge__seal" :src="BADGE_ART[id]" alt="" width="48" height="48">
    <span class="badge__name" :class="{ 'sr-only': small }">{{ t(`badge_${id}`) }}</span>
  </span>
</template>

<style scoped>
.badge {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  width: 5.5rem;
  text-align: center;
  font-size: var(--t-sm);
  line-height: var(--lh-snug);
  color: var(--c-body);
}
.badge__seal {
  display: block;
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border: 2px solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.badge--small { width: auto; }
.badge--small .badge__seal {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.95rem;
  border-width: 1.5px;
  box-shadow: 2px 2px 0 var(--c-ink);
}
</style>
