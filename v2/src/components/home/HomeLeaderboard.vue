<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHead from '../SectionHead.vue'
import LeaderboardList from '../LeaderboardList.vue'
import RankingTip from '../RankingTip.vue'
import { api } from '../../api/client'

// Top of this week's leaderboard on the home page (Emily, 2026-11-25), above
// "Pick your HSK level". Hidden until there is someone on it, and on errors.
const TOP = 5
const { t } = useI18n()
const entries = ref([])

onMounted(async () => {
  try {
    const { data } = await api.leaderboard()
    entries.value = data.data?.entries ?? []
  } catch {
    entries.value = []
  }
})
</script>

<template>
  <section v-if="entries.length" class="home-board">
    <SectionHead :title="t('homeLeaderboardHeadline')" />
    <div class="home-board__card">
      <LeaderboardList :entries="entries" :limit="TOP" />
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
.home-board__foot { position: relative; display: flex; align-items: center; gap: var(--s-2); }
</style>
