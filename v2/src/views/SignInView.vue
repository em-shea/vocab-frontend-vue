<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import SubscribeForm from '../components/SubscribeForm.vue'
import { rememberNext } from '../lib/signInReturn'
import { useAuthStore } from '../stores/auth'

// Step one of passwordless sign-in: ask for an address, email a one-time link.
// The link lands on /verification, which finishes the job.

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const status = ref('idle') // idle | sending | invalid | unknown | error

onMounted(() => {
  // Emails and the subscribe form link here with the address filled in.
  if (typeof route.query.email === 'string') email.value = route.query.email
})

// Deliberately loose. The browser's own type=email check runs first; this only
// catches what slips past it, and Cognito is the real judge of the address.
const looksLikeEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim())

async function submit () {
  if (status.value === 'sending') return
  if (!looksLikeEmail(email.value)) {
    status.value = 'invalid'
    return
  }
  status.value = 'sending'
  try {
    await auth.requestSignInLink(email.value)
    // Where to go once the emailed link is opened (see lib/signInReturn.js).
    rememberNext(route.query.next)
    router.push({ name: 'verification', query: route.query.lang ? { lang: route.query.lang } : {} })
  } catch (err) {
    // An address with no account is the one failure the visitor can act on:
    // the page offers to create one. Subscribing also emails a sign-in link,
    // so keep where to return to for when it is opened.
    if (err?.code === 'UserNotFoundException') {
      rememberNext(route.query.next)
      status.value = 'unknown'
    } else {
      status.value = 'error'
    }
  }
}
</script>

<template>
  <PageShell>
    <AppPanel>
      <h1 class="signin__title">{{ t('signInTitle') }}</h1>
      <p>{{ t('signInBody') }}</p>

      <form class="signin__form" novalidate @submit.prevent="submit">
        <label class="label" for="signin-email">{{ t('email') }}</label>
        <input
          id="signin-email"
          v-model="email"
          class="signin__input"
          type="email"
          autocomplete="email"
          inputmode="email"
          placeholder="you@example.com"
          :disabled="status === 'sending'"
          :aria-invalid="status === 'invalid'"
          aria-describedby="signin-msg"
        />
        <AppButton variant="seal" type="submit" :disabled="status === 'sending'">
          {{ status === 'sending' ? t('signInSending') : t('signInSend') }}
        </AppButton>
      </form>

      <p id="signin-msg" class="signin__msg" role="alert">
        <template v-if="status === 'invalid'">{{ t('signInInvalid') }}</template>
        <template v-else-if="status === 'unknown'">{{ t('signInUnknown') }}</template>
        <template v-else-if="status === 'error'">{{ t('signInError') }}</template>
      </p>

      <!-- No account for that address: offer to make one here, with the
           address filled in, rather than sending the visitor to the home page. -->
      <SubscribeForm v-if="status === 'unknown'" :key="email" id-prefix="signin" :initial-email="email.trim()" stacked hide-email />
      <p v-else class="signin__aside">
        {{ t('signInNoAccount') }}
        <RouterLink :to="{ name: 'home' }">{{ t('signInNoAccountLink') }}</RouterLink>
      </p>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.signin__title { font-size: var(--t-xl); }

.signin__form { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-3); }

.signin__input {
  width: 100%;
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body-lg);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
}

.signin__msg { color: var(--c-red); font-size: var(--t-base); min-height: 1.4em; }
.signin__aside { font-size: var(--t-base); color: var(--c-muted); }
</style>
