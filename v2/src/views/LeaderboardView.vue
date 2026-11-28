<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import LeaderboardList from '../components/LeaderboardList.vue'
import RankingTip from '../components/RankingTip.vue'
import { api } from '../api/client'
import { showThisWeek as atLeast, showLastWeek as lastAtLeast, MIN_ON_PAGE } from '../lib/leaderboard'
import { getSession } from '../api/session'

// This week's leaderboard (vocab GET /leaderboard): public profiles only,
// ranked by days practiced since Monday (UTC), then activities, then streak.
const { t, locale } = useI18n()

const board = ref(null)
const showThisWeek = (b) => atLeast(b, MIN_ON_PAGE)
const showLastWeek = (b) => lastAtLeast(b, MIN_ON_PAGE)
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
  <PageShell width="wide">
    <AppPanel>
      <div class="board__head">
        <h1 class="board__title">{{ t('leaderboardWeekly') }}</h1>
        <p v-if="board" class="board__week">{{ t('leaderboardWeek', { date: weekOf(board.week_start) }) }}</p>
      </div>

      <p v-if="status === 'loading'" role="status">{{ t('leaderboardLoading') }}</p>
      <div v-else-if="status === 'error'" role="alert" class="board__state">
        <p>{{ t('leaderboardError') }}</p>
        <AppButton variant="seal" @click="load">{{ t('profileRetry') }}</AppButton>
      </div>
      <template v-else>
        <template v-if="showLastWeek(board)">
          <h2 class="board__sub">{{ t('leaderboardLastTop') }}</h2>
          <LeaderboardList :entries="board.last_week" period="last" />
          <h2 class="board__sub">{{ t('leaderboardThisWeek') }}</h2>
        </template>
        <LeaderboardList v-if="showThisWeek(board)" :entries="board.entries" />
        <p v-else class="board__state">{{ t('leaderboardEmpty') }}</p>
      </template>

      <div v-if="status === 'ready' && (showThisWeek(board) || showLastWeek(board))" class="board__foot">
        <RouterLink v-if="!signedIn" :to="{ name: 'home' }">{{ t('leaderboardSubscribe') }}</RouterLink>
        <span v-else>{{ t('leaderboardHow') }}</span>
        <RankingTip />
      </div>
      <RouterLink v-else-if="status !== 'loading' && !signedIn" class="board__join" :to="{ name: 'home' }">
        {{ t('leaderboardSubscribe') }}
      </RouterLink>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.board__head { display: flex; flex-direction: column; gap: var(--s-1); }
.board__title { font-size: var(--t-xl); }
.board__week { margin: 0; color: var(--c-muted); font-size: var(--t-base); }
.board__state { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); margin: 0; color: var(--c-body); }

.board__join { align-self: flex-start; }
.board__sub { margin: var(--s-2) 0 0; font-size: var(--t-lead); }
.board__foot { position: relative; display: flex; align-items: center; gap: var(--s-2); color: var(--c-muted); font-size: var(--t-base); }
</style>
