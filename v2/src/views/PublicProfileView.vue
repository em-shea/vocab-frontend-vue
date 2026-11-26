<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import BadgeSeal from '../components/BadgeSeal.vue'
import SpriteAvatar from '../components/SpriteAvatar.vue'
import { api } from '../api/client'
import { knownBadges, publicName } from '../lib/badges'

// A learner's public profile (opt-in from profile settings; vocab GET
// /public_profile). Shows the chosen profile name, never the email.
const { t, locale } = useI18n()
const route = useRoute()

const profile = ref(null)
const status = ref('loading') // loading | ready | missing | error

async function load () {
  status.value = 'loading'
  try {
    const { data } = await api.publicProfile(route.params.handle)
    profile.value = data.data
    status.value = 'ready'
  } catch (e) {
    status.value = e?.response?.status === 404 ? 'missing' : 'error'
  }
}
watch(() => route.params.handle, load, { immediate: true })

const joined = (month) => {
  if (!month) return ''
  const [y, m] = month.split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)))
}
</script>

<template>
  <PageShell>
    <AppPanel>
      <p v-if="status === 'loading'" role="status">{{ t('publicLoading') }}</p>
      <template v-else-if="status === 'missing' || status === 'error'">
        <h1 class="public__name">{{ t(status === 'missing' ? 'publicMissing' : 'publicError') }}</h1>
        <RouterLink :to="{ name: 'leaderboard' }">{{ t('leaderboardTitle') }}</RouterLink>
      </template>
      <template v-else>
        <div class="public__top">
        <SpriteAvatar size="lg" :src="profile.avatar ?? null" />
        <div class="public__head">
          <p v-if="profile.name_pinyin && locale !== 'cn'" class="public__pinyin" lang="zh-Latn-pinyin">{{ profile.name_pinyin }}</p>
          <h1 class="public__name" :class="{ 'public__name--hanzi': publicName(profile) }">
            {{ publicName(profile) ?? t('publicUnnamed') }}
          </h1>
          <p v-if="profile.joined" class="public__joined">{{ t('publicJoined', { date: joined(profile.joined) }) }}</p>
        </div>
        </div>

        <dl class="public__stats">
          <div><dt>{{ t('publicStreak') }}</dt><dd>{{ t('publicDays', profile.streak.current) }}</dd></div>
          <div><dt>{{ t('publicBest') }}</dt><dd>{{ t('publicDays', profile.streak.best) }}</dd></div>
          <div><dt>{{ t('publicThisWeek') }}</dt><dd>{{ t('publicDays', profile.week.active_days) }}</dd></div>
        </dl>

        <section class="public__badges" aria-labelledby="badges-title">
          <h2 id="badges-title" class="label">{{ t('publicBadges') }}</h2>
          <div v-if="knownBadges(profile.badges).length" class="public__badge-row">
            <BadgeSeal v-for="id in knownBadges(profile.badges)" :id="id" :key="id" />
          </div>
          <p v-else class="public__none">{{ t('publicNoBadges') }}</p>
        </section>

        <RouterLink class="public__board" :to="{ name: 'leaderboard' }">{{ t('leaderboardTitle') }}</RouterLink>
      </template>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.public__top { display: flex; align-items: center; gap: var(--s-4); min-width: 0; }
.public__head { display: flex; flex-direction: column; gap: var(--s-1); }
.public__pinyin { margin: 0; color: var(--c-pinyin); font-size: var(--t-base); }
.public__name { font-size: var(--t-xl); line-height: var(--lh-tight); }
.public__name--hanzi { font-family: var(--f-hanzi); }
.public__joined { margin: 0; color: var(--c-muted); font-size: var(--t-base); }

.public__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--s-3);
  margin: 0;
}
.public__stats div {
  padding: var(--s-3);
  background: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
}
.public__stats dt { font-size: var(--t-sm); color: var(--c-muted); }
.public__stats dd { margin: 0; font-family: var(--f-display); font-size: var(--t-md); font-weight: var(--w-heavy); color: var(--c-ink); }

@media (max-width: 30rem) { .public__stats dd { font-size: var(--t-lead); } }
.public__badges { display: flex; flex-direction: column; gap: var(--s-3); }
.public__badges h2 { margin: 0; }
.public__badge-row { display: flex; flex-wrap: wrap; gap: var(--s-4) var(--s-2); }
.public__none { margin: 0; color: var(--c-body); }
.public__board { align-self: flex-start; }
</style>
