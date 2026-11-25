<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import LeaderboardList from '../components/LeaderboardList.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'

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

      <LeaderboardList v-else :entries="board.entries" />

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

.board__join { align-self: flex-start; }
</style>
