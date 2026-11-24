<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { SENTENCES_ENABLED, WRITING_ENABLED } from '../featureFlags'

// Phones only: the main places as tabs along the bottom of the screen, within
// thumb reach, like an app (Emily, 2026-11-23). The header keeps the rest
// (Review, Sign in, the language menu). Hidden on wide screens, where the
// header carries everything.
const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const tabs = computed(() => [
  // Signed in, Home is the profile; signed out, the home page.
  { key: 'home', label: t('navHome'), to: auth.signedIn ? { name: 'profile' } : { name: 'home' }, match: auth.signedIn ? ['profile'] : ['home'] },
  { key: 'quiz', label: t('navQuiz'), to: { name: 'quiz' }, match: ['quiz'] },
  SENTENCES_ENABLED && { key: 'sentences', label: t('navSentences'), to: { name: 'sentences' }, match: ['sentences'] },
  WRITING_ENABLED && { key: 'strokes', label: t('navWriting'), to: { name: 'write' }, match: ['write'] }
].filter(Boolean))

const current = (tab) => tab.match.includes(route.name)
</script>

<template>
  <nav class="tabs" :aria-label="t('navTabs')">
    <RouterLink v-for="tab in tabs" :key="tab.key" :to="tab.to" class="tab"
      :class="{ 'tab--current': current(tab) }" :aria-current="current(tab) ? 'page' : undefined">
      <svg class="tab__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
        fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter">
        <template v-if="tab.key === 'home'">
          <path d="M3 11 12 4l9 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5.5h4V20" />
        </template>
        <template v-else-if="tab.key === 'quiz'">
          <rect x="4" y="4" width="16" height="16" /><path d="m8 12.5 2.8 2.8L16.5 9.5" />
        </template>
        <template v-else-if="tab.key === 'sentences'">
          <path d="M4 7h11" /><path d="M4 12h8" /><path d="M4 17h5" /><path d="m14 19 1-3.5 5-5 2.5 2.5-5 5z" />
        </template>
        <template v-else>
          <!-- a 田字格 practice square with one stroke -->
          <rect x="4" y="4" width="16" height="16" /><path d="M12 4v16M4 12h16" stroke-width="0.9" stroke-dasharray="1.5 1.5" /><path d="M7 15.5c2.5-.3 6-2 9.5-7" stroke-width="2.4" />
        </template>
      </svg>
      <span class="tab__label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabs { display: none; }

@media (max-width: 719px) {
  .tabs {
    position: fixed;
    z-index: 40;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background-color: var(--c-ground);
    border-top: var(--bw-hair) solid var(--c-ink);
  }
  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: var(--tabbar-h);
    padding: var(--s-2) var(--s-1);
    font-family: var(--f-label);
    font-size: 0.6875rem;
    font-weight: var(--w-medium);
    color: var(--c-body);
    text-decoration: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .tab:active { background-color: color-mix(in srgb, var(--c-ink) 6%, transparent); }
  .tab__icon { width: 24px; height: 24px; }
  .tab--current { color: var(--c-seal); font-weight: var(--w-semi); }
  .tab__label { white-space: nowrap; }
}
</style>
