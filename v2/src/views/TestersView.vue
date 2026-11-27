<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import BadgeSeal from '../components/BadgeSeal.vue'
import { api } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { signInRoute } from '../lib/signInReturn'

// Join the early testers (Emily, 2026-11-26): one click, an optional question,
// the Early Tester badge at once (vocab POST /testers). Open until the end of
// 2026-12-31 UTC. "Early", not "founding": founding implies investment.
const CLOSES = '2026-12-31'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const answer = ref('')
const status = ref('idle') // idle | saving | error
const closed = computed(() => new Date().toISOString().slice(0, 10) > CLOSES)
const joined = computed(() => Boolean(auth.user?.founding_tester))

onMounted(async () => {
  if (auth.signedIn && !auth.user) await auth.loadUser()
})

async function join () {
  status.value = 'saving'
  try {
    await api.joinTesters(answer.value.trim() || undefined)
    auth.user = { ...auth.user, founding_tester: true }
    status.value = 'idle'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <PageShell>
    <AppPanel>
      <template v-if="joined">
        <h1 class="testers__title">{{ t('testersJoinedTitle') }}</h1>
        <div class="testers__badge"><BadgeSeal id="founding_tester" /></div>
        <p class="testers__body">{{ t('testersJoinedBody') }}</p>
        <RouterLink :to="{ name: 'profile' }">{{ t('testersToProfile') }}</RouterLink>
      </template>

      <template v-else>
        <h1 class="testers__title">{{ t('testersTitle') }}</h1>
        <p class="testers__body">{{ t('testersIntro') }}</p>

        <div class="testers__cols">
          <section>
            <h2 class="label">{{ t('testersGetHeading') }}</h2>
            <ul class="testers__list">
              <li>{{ t('testersGet1') }}</li>
              <li>{{ t('testersGet2') }}</li>
              <li>{{ t('testersGet3') }}</li>
              <li>{{ t('testersGet4') }}</li>
            </ul>
          </section>
          <section>
            <h2 class="label">{{ t('testersAskHeading') }}</h2>
            <ul class="testers__list">
              <li>{{ t('testersAsk1') }}</li>
              <li>{{ t('testersAsk2') }}</li>
              <li>{{ t('testersAsk3') }}</li>
            </ul>
          </section>
        </div>

        <p v-if="closed" class="testers__closed" role="status">{{ t('testersClosed') }}</p>

        <RouterLink v-else-if="!auth.signedIn" class="testers__signin" :to="signInRoute(route.fullPath)">
          {{ t('testersSignIn') }}
        </RouterLink>

        <form v-else class="testers__form" @submit.prevent="join">
          <label for="testers-answer" class="testers__label">{{ t('testersQuestion') }}</label>
          <textarea id="testers-answer" v-model="answer" rows="3" maxlength="500" class="testers__answer"></textarea>
          <AppButton type="submit" variant="seal" :disabled="status === 'saving'">{{ t('testersJoin') }}</AppButton>
          <p v-if="status === 'error'" class="testers__error" role="alert">{{ t('testersFailed') }}</p>
        </form>
      </template>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.testers__title { font-size: var(--t-xl); line-height: var(--lh-tight); }
.testers__body { margin: 0; color: var(--c-body); font-size: var(--t-lead); line-height: var(--lh-body); }
.testers__badge { display: flex; }
.testers__cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-6); }
@media (max-width: 40rem) { .testers__cols { grid-template-columns: minmax(0, 1fr); } }
.testers__cols h2 { margin: 0 0 var(--s-2); }
.testers__list { margin: 0; padding-left: 1.2em; display: flex; flex-direction: column; gap: var(--s-2); color: var(--c-body); }
.testers__form { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-3); }
.testers__label { font-weight: var(--w-semi); color: var(--c-ink); }
.testers__answer {
  width: 100%; box-sizing: border-box; padding: var(--s-3); font: inherit; font-size: 1rem;
  color: var(--c-ink); background: var(--c-raised); border: var(--bw-rule) solid var(--c-ink); resize: vertical;
}
.testers__signin { align-self: flex-start; }
.testers__closed, .testers__error { margin: 0; color: var(--c-seal); }
</style>
