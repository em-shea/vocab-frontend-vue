<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHead from '../SectionHead.vue'
import LeaderboardList from '../LeaderboardList.vue'
import RankingTip from '../RankingTip.vue'
import { api } from '../../api/client'
import { showThisWeek, showLastWeek } from '../../lib/leaderboard'

// Top of this week's leaderboard on the home page (Emily, 2026-11-25), above
// "Pick your HSK level". Hidden until 3 people are on it, and on errors.
// Mondays: last week's top 3 first.
const TOP = 5
const { t } = useI18n()
const board = ref(null)

onMounted(async () => {
  try {
    const { data } = await api.leaderboard()
    board.value = data.data ?? null
  } catch {
    board.value = null
  }
})
</script>

<template>
  <section v-if="showThisWeek(board) || showLastWeek(board)" class="home-board">
    <SectionHead :title="t('homeLeaderboardHeadline')" />
    <div class="home-board__card">
      <template v-if="showLastWeek(board)">
        <h3 class="home-board__sub">{{ t('leaderboardLastTop') }}</h3>
        <LeaderboardList :entries="board.last_week" period="last" />
        <h3 v-if="showThisWeek(board)" class="home-board__sub">{{ t('leaderboardThisWeek') }}</h3>
      </template>
      <LeaderboardList v-if="showThisWeek(board)" :entries="board.entries" :limit="TOP" />
      <div class="home-board__foot">
        <RouterLink :to="{ name: 'leaderboard' }">{{ t('homeLeaderboardMore') }}</RouterLink>
        <RankingTip />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-board { display: flex; flex-direction: column; gap: var(--s-6); }
.home-board__card {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-4) var(--s-6) var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.home-board__card :deep(.board__list) { border-top: 0; }
.home-board__card { position: relative; }
.home-board__sub { margin: var(--s-2) 0 0; font-family: var(--f-display); font-size: var(--t-lead); color: var(--c-ink); }
.home-board__foot { position: relative; display: flex; align-items: center; gap: var(--s-2); }
</style>
