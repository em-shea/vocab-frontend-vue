<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import SectionHead from '../components/SectionHead.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'

// Step two of passwordless sign-in. Reached two ways:
//
//   - straight from /signin, with no code: "check your email".
//   - from the emailed link, with ?code=…: answer the challenge and move on.
//
// The emailed link is https://<site>/verification?code=… and is built by the
// CreateAuthChallenge Lambda, so this path and parameter name are a contract
// with the backend and with every sign-in email already sitting in an inbox.

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const prefs = usePreferencesStore()

// waiting | verifying | invalid | elsewhere | resent | resendError
const status = ref('waiting')
const sentTo = ref(null)
const resending = ref(false)

// Profile is where sign-in has always led. Until that screen is ported the
// route does not exist here, so fall back to home rather than a blank page.
const afterSignIn = () => (router.hasRoute('profile') ? { name: 'profile' } : { name: 'home' })

onMounted(async () => {
  sentTo.value = auth.pendingEmail()
  const code = typeof route.query.code === 'string' ? route.query.code : null

  if (!code) {
    // Nothing was requested from this browser, so there is nothing to wait for.
    if (!sentTo.value) router.replace({ name: 'signin' })
    return
  }

  status.value = 'verifying'
  try {
    await auth.completeSignIn(code)
    // The account's saved reading settings win over this browser's, exactly as
    // they do when an existing session is restored on load.
    prefs.adoptFromUser(auth.user)
    router.replace(afterSignIn())
  } catch (err) {
    // Opened in a different browser from the one that asked: Cognito cannot
    // match the code to a challenge, and resending from here is impossible
    // because the address is unknown. Say so instead of claiming the link is bad.
    status.value = err?.code === 'NoPendingSignIn' ? 'elsewhere' : 'invalid'
  }
})

async function resend () {
  if (resending.value || !sentTo.value) return
  resending.value = true
  try {
    await auth.requestSignInLink(sentTo.value)
    status.value = 'resent'
  } catch {
    status.value = 'resendError'
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <PageShell>
    <SectionHead :label="t('verifyMark')" />

    <AppPanel>
      <template v-if="status === 'verifying'">
        <h1 class="verify__title">{{ t('verifyChecking') }}</h1>
        <p role="status" aria-live="polite">{{ t('verifyCheckingBody') }}</p>
      </template>

      <template v-else-if="status === 'elsewhere'">
        <h1 class="verify__title">{{ t('verifyElsewhereTitle') }}</h1>
        <p role="alert">{{ t('verifyElsewhereBody') }}</p>
        <AppButton as="RouterLink" :to="{ name: 'signin' }" variant="seal">
          {{ t('verifyStartAgain') }}
        </AppButton>
      </template>

      <template v-else>
        <h1 class="verify__title">{{ t('verifyTitle') }}</h1>
        <p>
          {{ t('verifyBody') }}
          <strong v-if="sentTo" class="verify__email">{{ sentTo }}</strong>
        </p>
        <p class="verify__aside">
          {{ t('verifyHelp') }}
          <a href="mailto:help@haohaotiantian.com">help@haohaotiantian.com</a>
        </p>

        <AppButton variant="primary" :disabled="resending" @click="resend">
          {{ resending ? t('signInSending') : t('verifyResend') }}
        </AppButton>

        <p class="verify__msg" :class="{ 'verify__msg--bad': status !== 'resent' }" role="alert">
          <template v-if="status === 'invalid'">{{ t('verifyInvalid') }}</template>
          <template v-else-if="status === 'resent'">{{ t('verifyResent') }}</template>
          <template v-else-if="status === 'resendError'">{{ t('signInError') }}</template>
        </p>
      </template>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.verify__title { font-size: var(--t-xl); }
.verify__email { color: var(--c-ink); overflow-wrap: anywhere; }
.verify__aside { font-size: var(--t-base); color: var(--c-muted); }
.verify__msg { font-size: var(--t-base); color: var(--c-seal); font-weight: var(--w-semi); min-height: 1.4em; }
.verify__msg--bad { color: var(--c-red); font-weight: var(--w-body); }
</style>
