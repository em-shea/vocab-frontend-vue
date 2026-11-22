<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import SiteNav from '../components/SiteNav.vue'
import ScrollRods from '../components/ScrollRods.vue'
import HomeHero from '../components/home/HomeHero.vue'
import ChooseStudy from '../components/home/ChooseStudy.vue'
import DailyEmail from '../components/home/DailyEmail.vue'
import ReadYourWay from '../components/home/ReadYourWay.vue'
import StudyWays from '../components/home/StudyWays.vue'
import CollectHeroes from '../components/home/CollectHeroes.vue'
import SiteFooter from '../components/SiteFooter.vue'
import ClosingBand from '../components/home/ClosingBand.vue'

import { HEROES_LAUNCHED } from '../featureFlags'

// Placeholder artwork throughout: Kuniyoshi's One Hundred and Eight Heroes of
// the Popular Water Margin, public domain. See src/assets/prints/README.md.
//
// Two versions of the page come from the same sections. The flag picks one;
// ?home=heroes or ?home=launch overrides it for preview and tests. Sections
// that differ only a little take a `heroes` prop, so a copy fix lands in both.

const route = useRoute()
const heroes = computed(() => {
  const override = route.query.home
  if (override === 'heroes') return true
  if (override === 'launch') return false
  return HEROES_LAUNCHED
})
</script>

<template>
  <div class="page">
    <ScrollRods position="top" />

    <div class="page__inner">
      <SiteNav />

      <HomeHero :heroes="heroes" />
      <ChooseStudy :heroes="heroes" />
      <DailyEmail />
      <ReadYourWay />
      <StudyWays :heroes="heroes" />
      <CollectHeroes v-if="heroes" />
      <ClosingBand :heroes="heroes" />
      <SiteFooter />
    </div>

    <ScrollRods position="bottom" />
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--s-6); min-height: 100vh; padding: var(--s-4) 0; }

.page__inner {
  display: flex;
  flex-direction: column;
  gap: var(--s-24);
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--s-4);
}

@media (min-width: 720px) {
  .page__inner { padding: 0 var(--s-14); }
}
</style>
