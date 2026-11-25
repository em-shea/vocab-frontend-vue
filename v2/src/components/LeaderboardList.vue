<script setup>
import { useI18n } from 'vue-i18n'

import BadgeSeal from './BadgeSeal.vue'
import SpriteAvatar from './SpriteAvatar.vue'
import { knownBadges, publicName } from '../lib/badges'

// Rows of the weekly leaderboard (vocab GET /leaderboard entries): rank,
// avatar, name, badges, days practiced this week out of 7, current streak.
// Used by /leaderboard and the home page (top few).
const props = defineProps({
  entries: { type: Array, required: true },
  limit: { type: Number, default: null }
})
const { t } = useI18n()
</script>

<template>
  <ol class="board__list">
    <li v-for="entry in (props.limit ? props.entries.slice(0, props.limit) : props.entries)" :key="entry.handle" class="board__row">
      <span class="board__rank">{{ entry.rank }}</span>
      <span class="board__who">
        <SpriteAvatar size="sm" decorative :src="entry.avatar ?? null" />
        <RouterLink :to="{ name: 'public-profile', params: { handle: entry.handle } }" :class="{ 'board__hanzi': publicName(entry) }">
          {{ publicName(entry) ?? t('publicUnnamed') }}
        </RouterLink>
        <span v-if="knownBadges(entry.badges).length" class="board__badges">
          <BadgeSeal v-for="id in knownBadges(entry.badges)" :id="id" :key="id" small />
        </span>
      </span>
      <span class="board__num">
        <strong>{{ entry.week.active_days }}/7</strong>
        <span class="sr-only">{{ t('leaderboardDaysThisWeek') }}</span>
      </span>
      <span class="board__num board__streak">
        {{ t('leaderboardStreak', { n: entry.streak.current }) }}
      </span>
    </li>
  </ol>
</template>

<style scoped>
.board__list { list-style: none; margin: 0; padding: 0; border-top: var(--bw-rule) solid var(--c-ink); }
.board__row {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) 0;
  border-bottom: var(--bw-hair) solid var(--c-rule);
}
.board__row:nth-child(-n + 3) .board__rank { color: var(--c-seal); }
.board__rank { font-family: var(--f-display); font-weight: var(--w-heavy); font-size: var(--t-md); text-align: center; }
.board__who { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2); min-width: 0; }
.board__who a { overflow-wrap: anywhere; }
.board__hanzi { font-family: var(--f-hanzi); font-size: var(--t-lead); }
.board__badges { display: inline-flex; gap: var(--s-1); }
.board__num { font-size: var(--t-base); color: var(--c-ink); white-space: nowrap; }
.board__num strong { font-family: var(--f-display); font-size: var(--t-lead); }
.board__streak { color: var(--c-muted); }
@media (max-width: 30rem) {
  .board__row { grid-template-columns: 1.5rem minmax(0, 1fr) auto; }
  .board__streak { grid-column: 2; }
}
</style>
