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
// - Up to 5 badges, rarest first; none on phones.
// - Columns: days this week (ranks), tasks this week (breaks ties), days in
//   streak (faded: for interest only). A ? in the header explains the order.
// - Gold, silver and bronze on the top three's rank and avatar frame.
// - The signed-in learner's row is marked "You"; when a limit cuts it off it is
//   pinned under the list after a gap. Signed in but not public: a row inviting
//   them to join.
const MAX_BADGES = 5

const props = defineProps({
  entries: { type: Array, required: true },
  limit: { type: Number, default: null },
  // 'last' labels the columns for last week (Monday's top 3) and drops the
  // pinned and join rows, which are about this week.
  period: { type: String, default: 'this' }
})
const { t } = useI18n()
const auth = useAuthStore()
const myHandle = computed(() => (auth.user?.public_profile && auth.user?.public_handle) || null)
const last = computed(() => props.period === 'last')
const col = (key) => (last.value ? `${key}Last` : key)
const canJoin = computed(() => !last.value && Boolean(auth.signedIn && auth.user && !auth.user.public_profile))

const shown = computed(() => (props.limit ? props.entries.slice(0, props.limit) : props.entries))
const pinned = computed(() => {
  if (last.value || !myHandle.value || !props.limit) return null
  const i = props.entries.findIndex((e) => e.handle === myHandle.value)
  return i >= props.limit ? props.entries[i] : null
})
const medal = (rank) => ({ 1: 'gold', 2: 'silver', 3: 'bronze' })[rank] ?? null
</script>

<template>
  <ol class="board__list">
    <li class="board__row board__row--head">
      <span class="board__h-week" aria-hidden="true">{{ t(col('leaderboardColWeek')) }}</span>
      <span class="board__h-days" aria-hidden="true"><span class="board__long">{{ t(col('leaderboardColDays')) }}</span><span class="board__short">{{ t('leaderboardColDaysShort') }}</span></span>
      <span class="board__h-acts" aria-hidden="true"><span class="board__long">{{ t(col('leaderboardColActs')) }}</span><span class="board__short">{{ t('leaderboardColActsShort') }}</span></span>
      <span class="board__h-streak" aria-hidden="true"><span class="board__long">{{ t('leaderboardColStreak') }}</span><span class="board__short">{{ t('leaderboardColStreakShort') }}</span></span>
    </li>
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
        <span class="board__n board__days"><span class="sr-only">{{ t(col('leaderboardColDays')) }}: </span>{{ entry.week.active_days }}</span>
        <span class="board__n board__acts"><span class="sr-only">{{ t(col('leaderboardColActs')) }}: </span>{{ entry.week.actions }}</span>
        <span class="board__n board__streak"><span class="sr-only">{{ t('leaderboardColStreak') }}: </span>{{ entry.streak.current }}</span>
      </li>
    </template>
    <li v-if="canJoin" class="board__join-row">
      <span>{{ t('leaderboardNotOn') }}</span>
      <RouterLink :to="{ name: 'profile-settings', hash: '#public' }">{{ t('leaderboardJoin') }}</RouterLink>
    </li>
  </ol>
</template>

<style scoped>
.board__list { container-type: inline-size; list-style: none; margin: 0; padding: 0; }
.board__row--head { position: relative; }
.board__row {
  --badge: 1.5rem;
  display: grid;
  grid-template-columns: 2rem 2rem 10rem minmax(0, 1fr) 4.5rem 4.5rem 4.5rem;
  grid-template-areas: "rank avatar name badges days acts streak";
  align-items: center;
  column-gap: var(--s-3);
  padding: var(--s-3) 0;
  border-bottom: var(--bw-hair) solid var(--c-rule);
}
.board__row--head {
  padding: 0 0 var(--s-2);
  border-bottom: var(--bw-rule) solid var(--c-ink);
  font-family: var(--f-label);
  font-size: var(--t-xs, 0.75rem);
  font-weight: var(--w-semi);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-muted);
  line-height: 1.2;
}
.board__h-days { grid-area: days; } .board__h-acts { grid-area: acts; } .board__h-streak { grid-area: streak; }
.board__h-days, .board__h-acts, .board__h-streak { text-align: right; align-self: end; }
.board__h-week { display: none; }
.board__h-streak { opacity: 0.7; }
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
.board__n { text-align: right; font-family: var(--f-display); font-weight: var(--w-heavy); font-size: var(--t-base); color: var(--c-ink); font-variant-numeric: tabular-nums; }
.board__days { grid-area: days; } .board__acts { grid-area: acts; color: var(--c-muted); font-weight: var(--w-semi); } .board__streak { grid-area: streak; color: var(--c-muted); font-weight: var(--w-body); opacity: 0.7; }

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

.board__short { display: none; }
/* Phones: no badges; short headers. */
/* Sized by the list's own width, so the narrow /leaderboard panel gets it too. */
@container (max-width: 36rem) {
  .board__row {
    grid-template-columns: 1.25rem 2rem minmax(0, 1fr) 2.25rem 2.5rem 3rem;
    grid-template-areas: "rank avatar name days acts streak";
    column-gap: var(--s-2);
  }
  .board__row--head {
    grid-template-areas:
      "rank avatar name week week streak"
      "rank avatar name days acts streak";
    row-gap: var(--s-1);
    font-size: 0.625rem;
    letter-spacing: 0.03em;
  }
  .board__h-week {
    display: block;
    grid-area: week;
    text-align: center;
    padding-bottom: 2px;
    border-bottom: var(--bw-hair) solid var(--c-muted);
  }
  .board__h-streak .board__short { display: none; }
  .board__h-streak .board__long { display: inline; }
  .board__badges { display: none; }
  .board__long { display: none; }
  .board__short { display: inline; }
  .board__rank { font-size: var(--t-base); }
  .board__name a { font-size: var(--t-base); }
}
</style>
