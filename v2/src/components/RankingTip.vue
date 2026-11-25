<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

// "?" that explains how the weekly leaderboard is ranked. Sits at the foot of
// the board, beside the link under it (Emily, 2026-11-25); opens upwards.
const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <span class="tip">
    <button type="button" class="tip__button" :aria-expanded="open" aria-describedby="board-how"
      :aria-label="t('leaderboardHow')" @click="open = !open" @blur="open = false">?</button>
    <span id="board-how" role="tooltip" class="tip__text" :class="{ 'tip__text--open': open }">{{ t('leaderboardRule') }}</span>
  </span>
</template>

<style scoped>
.tip { display: inline-flex; }
.tip__button {
  display: grid; place-items: center; width: 1.25rem; height: 1.25rem; padding: 0;
  font: inherit; font-size: 0.75rem; font-weight: 700; line-height: 1; color: var(--c-ink);
  background: none; border: var(--bw-hair) solid currentColor; border-radius: 50%; cursor: help;
}
.tip__text {
  position: absolute; z-index: 5; left: 0; right: 0; bottom: calc(100% + var(--s-2));
  padding: var(--s-3) var(--s-4); font-size: var(--t-sm); line-height: var(--lh-snug);
  color: var(--c-ground); background-color: var(--c-ink); box-shadow: var(--shadow-hard);
  visibility: hidden; opacity: 0; transition: opacity 120ms;
}
.tip:hover .tip__text, .tip__button:focus-visible + .tip__text, .tip__text--open { visibility: visible; opacity: 1; }
</style>
