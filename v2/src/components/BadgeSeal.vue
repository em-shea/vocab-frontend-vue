<script setup>
import { useI18n } from 'vue-i18n'
import { BADGE_ART } from '../lib/badges'

// One badge: a square crop of a woodblock print, its name beneath.
defineProps({
  id: { type: String, required: true },
  small: { type: Boolean, default: false }
})
const { t } = useI18n()
// Why the badge was earned shows on hover or keyboard focus (Emily, 2026-11-25).
const uid = Math.random().toString(36).slice(2, 8)
</script>

<template>
  <span class="badge" :class="{ 'badge--small': small }" tabindex="0" :aria-describedby="`why-${uid}`">
    <img class="badge__seal" :src="BADGE_ART[id]" alt="" width="48" height="48">
    <span class="badge__name" :class="{ 'sr-only': small }">{{ t(`badge_${id}`) }}</span>
    <span :id="`why-${uid}`" role="tooltip" class="badge__why">{{ t(`badgeWhy_${id}`) }}</span>
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
.badge { position: relative; outline-offset: 2px; }
.badge__why {
  position: absolute; z-index: 6; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  width: max-content; max-width: 14rem; padding: var(--s-2) var(--s-3);
  font-size: var(--t-sm); line-height: var(--lh-snug); text-align: left; white-space: normal;
  color: var(--c-ground); background-color: var(--c-ink); box-shadow: var(--shadow-hard);
  visibility: hidden; opacity: 0; transition: opacity 120ms; pointer-events: none;
}
.badge:hover .badge__why, .badge:focus-visible .badge__why { visibility: visible; opacity: 1; }
.badge--small { width: auto; }
.badge--small .badge__seal {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.95rem;
  border-width: 1.5px;
  box-shadow: 2px 2px 0 var(--c-ink);
}
</style>
