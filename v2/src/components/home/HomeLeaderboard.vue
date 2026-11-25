<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHead from '../SectionHead.vue'
import LeaderboardList from '../LeaderboardList.vue'
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
    <LeaderboardList :entries="entries" :limit="TOP" />
    <RouterLink class="home-board__more" :to="{ name: 'leaderboard' }">{{ t('homeLeaderboardMore') }}</RouterLink>
  </section>
</template>

<style scoped>
.home-board { display: flex; flex-direction: column; gap: var(--s-6); }
.home-board__more { align-self: flex-start; }
</style>
