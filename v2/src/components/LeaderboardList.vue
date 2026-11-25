<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BadgeSeal from './BadgeSeal.vue'
import SpriteAvatar from './SpriteAvatar.vue'
import { rarestBadges, publicName } from '../lib/badges'
import { useAuthStore } from '../stores/auth'

// Rows of the weekly leaderboard (vocab GET /leaderboard entries), used by
// /leaderboard and the home page (top few). Emily, 2026-11-25:
// - Columns line up: rank, avatar, name (fixed width), badges, metrics.
// - Up to 5 badges, rarest first; on a phone only as many as fit.
// - Metrics say why the order is what it is: days practiced this week (what
//   the board ranks by), then the current streak.
// - Gold, silver and bronze on the top three's rank and avatar frame.
// - The signed-in learner's row is marked "You"; when a limit cuts it off it is
//   pinned under the list after a gap. Signed in but not public: a row inviting
//   them to join.
const MAX_BADGES = 5

const props = defineProps({
  entries: { type: Array, required: true },
  limit: { type: Number, default: null }
})
const { t } = useI18n()
const auth = useAuthStore()
const myHandle = computed(() => (auth.user?.public_profile && auth.user?.public_handle) || null)
const canJoin = computed(() => Boolean(auth.signedIn && auth.user && !auth.user.public_profile))

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
        <SpriteAvatar size="sm" decorative :src="entry.avatar ?? null" class="board__avatar" />
        <span class="board__name">
          <RouterLink :to="{ name: 'public-profile', params: { handle: entry.handle } }" :class="{ 'board__hanzi': publicName(entry) }">
            {{ publicName(entry) ?? t('publicUnnamed') }}
          </RouterLink>
          <span v-if="entry.handle === myHandle" class="board__you">{{ t('leaderboardYou') }}</span>
        </span>
        <span class="board__badges">
          <BadgeSeal v-for="id in rarestBadges(entry.badges, MAX_BADGES)" :id="id" :key="id" small />
        </span>
        <span class="board__metrics">
          <strong>{{ t('leaderboardDaysWeek', entry.week.active_days) }}</strong>
          <span>{{ t('leaderboardStreak', { n: entry.streak.current }) }}</span>
        </span>
      </li>
    </template>
    <li v-if="canJoin" class="board__join-row">
      <span>{{ t('leaderboardNotOn') }}</span>
      <RouterLink :to="{ name: 'profile-settings', hash: '#public' }">{{ t('leaderboardJoin') }}</RouterLink>
    </li>
  </ol>
</template>

<style scoped>
.board__list { list-style: none; margin: 0; padding: 0; border-top: var(--bw-rule) solid var(--c-ink); }
.board__row {
  --badge: 1.5rem;
  display: grid;
  grid-template-columns: 2rem 2rem 10rem minmax(0, 1fr) auto;
  grid-template-areas: "rank avatar name badges metrics";
  align-items: center;
  column-gap: var(--s-3);
  padding: var(--s-3) 0;
  border-bottom: var(--bw-hair) solid var(--c-rule);
}
.board__rank { grid-area: rank; font-family: var(--f-display); font-weight: var(--w-heavy); font-size: var(--t-md); text-align: center; }
.board__avatar { grid-area: avatar; }
.board__name { grid-area: name; display: flex; align-items: center; gap: var(--s-2); min-width: 0; }
.board__name a { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.board__hanzi { font-family: var(--f-hanzi); font-size: var(--t-lead); }
/* One row of badges; any that don't fit wrap out of sight (phones). */
.board__badges {
  grid-area: badges;
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  height: calc(var(--badge) + 3px);
  overflow: hidden;
  min-width: 0;
}
.board__metrics { grid-area: metrics; display: flex; flex-direction: column; align-items: flex-end; text-align: right; white-space: nowrap; line-height: var(--lh-snug); }
.board__metrics strong { font-size: var(--t-base); color: var(--c-ink); }
.board__metrics span { font-size: var(--t-sm); color: var(--c-muted); }

/* Gold, silver, bronze for the top three: rank number and avatar frame. */
.board__row--gold { --medal: #C9962E; }
.board__row--silver { --medal: #8E96A6; }
.board__row--bronze { --medal: #A8643A; }
.board__row--gold .board__rank, .board__row--silver .board__rank, .board__row--bronze .board__rank { color: var(--medal); }
.board__row--gold .board__avatar, .board__row--silver .board__avatar, .board__row--bronze .board__avatar {
  outline: 2px solid var(--medal);
  outline-offset: 0;
  background-color: color-mix(in srgb, var(--medal) 22%, var(--c-sunk));
}
/* The learner's own row. */
.board__row--me {
  margin: 0 calc(-1 * var(--s-2));
  padding-left: var(--s-2);
  padding-right: var(--s-2);
  background: color-mix(in srgb, var(--c-gold) 18%, transparent);
  box-shadow: inset 3px 0 0 var(--c-seal);
}
.board__you {
  flex: none;
  padding: 0 var(--s-2);
  font-size: var(--t-sm);
  font-weight: var(--w-bold);
  color: var(--c-on-red);
  background: var(--c-seal);
}
.board__gap { padding: var(--s-1) 0; text-align: center; color: var(--c-muted); border-bottom: var(--bw-hair) solid var(--c-rule); }
.board__join-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2) var(--s-4);
  margin: 0 calc(-1 * var(--s-2));
  padding: var(--s-3) var(--s-2);
  color: var(--c-body);
  border: var(--bw-hair) dashed var(--c-ink);
  border-top: 0;
}

/* Phones: badges beside the name, as many as fit; metrics on a line below. */
@media (max-width: 40rem) {
  .board__row {
    grid-template-columns: 1.5rem 2rem 7rem minmax(0, 1fr);
    grid-template-areas:
      "rank avatar name badges"
      "rank avatar metrics metrics";
    column-gap: var(--s-2);
    row-gap: 2px;
  }
  .board__metrics { flex-direction: row; gap: var(--s-1); align-items: baseline; text-align: left; }
  .board__metrics strong { font-size: var(--t-sm); }
  .board__metrics span::before { content: '· '; }
  .board__name a { font-size: var(--t-base); }
}
</style>
