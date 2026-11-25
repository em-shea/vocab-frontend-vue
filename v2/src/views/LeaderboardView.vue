<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import BadgeSeal from '../components/BadgeSeal.vue'
import SpriteAvatar from '../components/SpriteAvatar.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { knownBadges, publicName } from '../lib/badges'

// This week's leaderboard (vocab GET /leaderboard): public profiles only,
// ranked by days practiced since Monday (UTC), then activities, then streak.
const { t, locale } = useI18n()

const board = ref(null)
const status = ref('loading') // loading | ready | error
const signedIn = ref(false)

async function load () {
  status.value = 'loading'
  try {
    const { data } = await api.leaderboard()
    board.value = data.data
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}
onMounted(async () => {
  signedIn.value = Boolean(await getSession())
  await load()
})

const weekOf = (iso) => new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${iso}T00:00:00Z`))
</script>

<template>
  <PageShell>
    <AppPanel>
      <div class="board__head">
        <h1 class="board__title">{{ t('leaderboardTitle') }}</h1>
        <p v-if="board" class="board__week">{{ t('leaderboardWeek', { date: weekOf(board.week_start) }) }}</p>
      </div>

      <p v-if="status === 'loading'" role="status">{{ t('leaderboardLoading') }}</p>
      <div v-else-if="status === 'error'" role="alert" class="board__state">
        <p>{{ t('leaderboardError') }}</p>
        <AppButton variant="seal" @click="load">{{ t('profileRetry') }}</AppButton>
      </div>
      <p v-else-if="!board.entries.length" class="board__state">{{ t('leaderboardEmpty') }}</p>

      <ol v-else class="board__list">
        <li v-for="entry in board.entries" :key="entry.handle" class="board__row">
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

      <RouterLink v-if="status !== 'loading'" class="board__join" :to="signedIn ? { name: 'profile-settings', hash: '#public' } : { name: 'home' }">
        {{ t(signedIn ? 'leaderboardJoin' : 'leaderboardSubscribe') }}
      </RouterLink>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.board__head { display: flex; flex-direction: column; gap: var(--s-1); }
.board__title { font-size: var(--t-xl); }
.board__week { margin: 0; color: var(--c-muted); font-size: var(--t-base); }
.board__state { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); margin: 0; color: var(--c-body); }

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
.board__join { align-self: flex-start; }
@media (max-width: 30rem) {
  .board__row { grid-template-columns: 1.5rem minmax(0, 1fr) auto; }
  .board__streak { grid-column: 2; }
}
</style>
