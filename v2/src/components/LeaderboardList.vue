<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BadgeSeal from './BadgeSeal.vue'
import SpriteAvatar from './SpriteAvatar.vue'
import { knownBadges, publicName } from '../lib/badges'
import { useAuthStore } from '../stores/auth'

// Rows of the weekly leaderboard (vocab GET /leaderboard entries): rank,
// avatar, name, badges, current streak. Ranked by days practiced this week.
// Used by /leaderboard and the home page (top few).
// Ranks 1-3 get gold, silver and bronze on the number and the avatar frame.
// The signed-in learner's own row is marked "You"; when a limit cuts it off,
// it is pinned under the list after a gap row (Emily, 2026-11-25).
const props = defineProps({
  entries: { type: Array, required: true },
  limit: { type: Number, default: null }
})
const { t } = useI18n()
const auth = useAuthStore()
const myHandle = computed(() => (auth.user?.public_profile && auth.user?.public_handle) || null)

const shown = computed(() => (props.limit ? props.entries.slice(0, props.limit) : props.entries))
const pinned = computed(() => {
  if (!myHandle.value || !props.limit) return null
  const i = props.entries.findIndex((e) => e.handle === myHandle.value)
  return i >= props.limit ? props.entries[i] : null
})
const medal = (rank) => ({ 1: 'gold', 2: 'silver', 3: 'bronze' })[rank] ?? null
</script>

<template>
  <ol class="board__list">
    <template v-for="entry in (pinned ? [...shown, null, pinned] : shown)" :key="entry?.handle ?? 'gap'">
      <li v-if="!entry" class="board__gap" aria-hidden="true">⋯</li>
      <li v-else class="board__row" :class="[medal(entry.rank) && `board__row--${medal(entry.rank)}`, { 'board__row--me': entry.handle === myHandle }]">
        <span class="board__rank">{{ entry.rank }}</span>
        <span class="board__who">
          <SpriteAvatar size="sm" decorative :src="entry.avatar ?? null" class="board__avatar" />
          <RouterLink :to="{ name: 'public-profile', params: { handle: entry.handle } }" :class="{ 'board__hanzi': publicName(entry) }">
            {{ publicName(entry) ?? t('publicUnnamed') }}
          </RouterLink>
          <span v-if="entry.handle === myHandle" class="board__you">{{ t('leaderboardYou') }}</span>
          <span v-if="knownBadges(entry.badges).length" class="board__badges">
            <BadgeSeal v-for="id in knownBadges(entry.badges)" :id="id" :key="id" small />
          </span>
        </span>
        <span class="board__num board__streak">
          {{ t('leaderboardStreak', { n: entry.streak.current }) }}
        </span>
      </li>
    </template>
  </ol>
</template>

<style scoped>
.board__list { list-style: none; margin: 0; padding: 0; border-top: var(--bw-rule) solid var(--c-ink); }
.board__row {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) 0;
  border-bottom: var(--bw-hair) solid var(--c-rule);
}
/* Gold, silver, bronze for the top three: rank number and avatar frame. */
.board__row--gold { --medal: #C9962E; }
.board__row--silver { --medal: #8E96A6; }
.board__row--bronze { --medal: #A8643A; }
.board__row--gold .board__rank, .board__row--silver .board__rank, .board__row--bronze .board__rank { color: var(--medal); }
.board__row--gold :deep(.board__avatar), .board__row--silver :deep(.board__avatar), .board__row--bronze :deep(.board__avatar) {
  outline: 2px solid var(--medal);
  outline-offset: 0;
  background-color: color-mix(in srgb, var(--medal) 22%, var(--c-sunk));
}
/* The learner's own row. */
.board__row--me { margin: 0 calc(-1 * var(--s-2)); padding-left: var(--s-2); padding-right: var(--s-2); background: color-mix(in srgb, var(--c-gold) 18%, transparent); box-shadow: inset 3px 0 0 var(--c-seal); }
.board__you {
  padding: 0 var(--s-2);
  font-size: var(--t-sm);
  font-weight: var(--w-bold, 600);
  color: var(--c-on-red);
  background: var(--c-seal);
}
.board__gap { padding: var(--s-1) 0; text-align: center; color: var(--c-muted); border-bottom: var(--bw-hair) solid var(--c-rule); }
.board__rank { font-family: var(--f-display); font-weight: var(--w-heavy); font-size: var(--t-md); text-align: center; }
.board__who { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2); min-width: 0; }
.board__who a { overflow-wrap: anywhere; }
.board__hanzi { font-family: var(--f-hanzi); font-size: var(--t-lead); }
.board__badges { display: inline-flex; gap: var(--s-1); }
.board__num { font-size: var(--t-base); color: var(--c-ink); white-space: nowrap; }
.board__streak { color: var(--c-muted); }
@media (max-width: 30rem) {
  .board__row { grid-template-columns: 1.5rem minmax(0, 1fr); }
  .board__streak { grid-column: 2; }
}
</style>
