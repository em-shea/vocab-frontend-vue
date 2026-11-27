<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { signInRoute } from '../lib/signInReturn'

// Feedback from signed-in learners. The backend emails it to nihao@ with
// Reply-To set to the learner, so we can answer them; that's why the page and
// the footer link are only for people who are signed in.
const MAX = 2000

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const message = ref('')
const state = ref('idle') // idle | sending | sent | failed

onMounted(async () => {
  if (!(await getSession())) router.replace(signInRoute(route.fullPath))
})

async function send () {
  if (!message.value.trim() || state.value === 'sending') return
  state.value = 'sending'
  try {
    const from = typeof route.query.from === 'string' ? route.query.from : ''
    await api.sendFeedback(message.value.trim(), from)
    state.value = 'sent'
  } catch {
    state.value = 'failed'
  }
}
</script>

<template>
  <PageShell>
    <AppPanel>
      <h1 class="feedback__title">{{ t('feedbackTitle') }}</h1>

      <div v-if="state === 'sent'" class="feedback__done" role="status">
        <p>{{ t('feedbackThanks') }}</p>
        <RouterLink :to="{ name: 'home' }">{{ t('feedbackHome') }}</RouterLink>
      </div>

      <form v-else class="feedback__form" @submit.prevent="send">
        <p class="feedback__intro">{{ t('feedbackIntro') }}</p>
        <label class="label" for="feedback-message">{{ t('feedbackLabel') }}</label>
        <textarea
          id="feedback-message"
          v-model="message"
          class="feedback__text"
          rows="7"
          :maxlength="MAX"
          required
        />
        <p v-if="state === 'failed'" class="feedback__error" role="alert">{{ t('feedbackFailed') }}</p>
        <div>
          <AppButton type="submit" variant="seal" :disabled="!message.trim() || state === 'sending'">
            {{ state === 'sending' ? t('feedbackSending') : t('feedbackSend') }}
          </AppButton>
        </div>
      </form>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.feedback__title { font-size: var(--t-xl); }
.feedback__intro { margin: 0 0 var(--s-2); color: var(--c-body); }
.feedback__form { display: flex; flex-direction: column; gap: var(--s-3); }
.feedback__text {
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body);
  line-height: var(--lh-snug);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
  resize: vertical;
  min-width: 0;
}
.feedback__error { margin: 0; color: var(--c-red); }
.feedback__done { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); color: var(--c-body); }
.feedback__done p { margin: 0; }
</style>
