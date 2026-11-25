<script setup>
import { useI18n } from 'vue-i18n'
import { BADGE_GLYPHS } from '../lib/badges'

// One badge: a square seal with a single character, its name beneath.
defineProps({
  id: { type: String, required: true },
  small: { type: Boolean, default: false }
})
const { t } = useI18n()
</script>

<template>
  <figure class="badge" :class="{ 'badge--small': small }">
    <span class="badge__seal" aria-hidden="true">{{ BADGE_GLYPHS[id] }}</span>
    <figcaption :class="{ 'sr-only': small }">{{ t(`badge_${id}`) }}</figcaption>
  </figure>
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
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  font-family: var(--f-brush);
  font-size: 1.75rem;
  line-height: 1;
  color: var(--c-on-red);
  background: var(--c-seal);
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
