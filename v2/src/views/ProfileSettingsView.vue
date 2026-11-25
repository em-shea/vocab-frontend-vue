<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInRoute } from '../lib/signInReturn'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { useAuthStore } from '../stores/auth'
import { nameOptions, namePayload, profileName, NOT_SET } from '../lib/profile'
import { pushState, isSubscribed, subscribe, unsubscribe } from '../lib/push'

// Profile settings: the learner's email, and the name the profile shows.
// Like the old screen, a new name is saved as soon as it is chosen
// (POST /update_user).
//
// Two of the old screen's settings are not here. Character set is chosen
// site-wide from the globe menu, which already saves it to the account. The
// emoji avatar has gone with emoji from the site; the stored value is left
// untouched, because only the name fields are sent.

// The name's pinyin shows here only, and not in 中文 (immersion) mode.
const { t, locale } = useI18n()
const optionLabel = (option) => locale.value === 'cn' ? option.character : `${option.character} ${option.pinyin}`
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const user = ref(null)
const status = ref('loading') // loading | ready | error
const choice = ref(NOT_SET)   // the chosen name's characters, or NOT_SET
const save = ref('idle')      // idle | saving | saved | failed

const options = computed(() => nameOptions(user.value))

async function load () {
  status.value = 'loading'
  try {
    const { data } = await api.user()
    user.value = data?.data ?? data
    choice.value = profileName(user.value)?.name ?? NOT_SET
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

onMounted(async () => {
  if (!(await getSession())) {
    router.replace(signInRoute(route.fullPath))
    return
  }
  await load()
  if (push.value === 'ok') pushOn.value = await isSubscribed().catch(() => false)
})

// Daily word notifications, per device (each phone or browser opts in).
const push = ref(pushState())
const pushOn = ref(false)
const pushBusy = ref(false)
const pushError = ref('')

async function togglePush (event) {
  const want = event.target.checked
  pushBusy.value = true
  pushError.value = ''
  try {
    if (want) {
      pushOn.value = await subscribe()
      if (!pushOn.value) push.value = pushState()
    } else {
      await unsubscribe()
      pushOn.value = false
    }
  } catch {
    pushError.value = 'pushFailed'
  } finally {
    event.target.checked = pushOn.value
    pushBusy.value = false
  }
}

// Public profile and leaderboard entry (vocab POST /public_profile). Off
// until the learner switches it on; shows the profile name, never the email.
const publicBusy = ref(false)
const publicError = ref(false)

async function togglePublic (event) {
  const want = event.target.checked
  publicBusy.value = true
  publicError.value = false
  try {
    const { data } = await api.setPublicProfile(want)
    user.value = { ...user.value, public_profile: data.data.public, public_handle: data.data.handle }
  } catch {
    publicError.value = true
  } finally {
    event.target.checked = Boolean(user.value?.public_profile)
    publicBusy.value = false
  }
}

// Only the latest save may report: choosing twice quickly must not let the
// first answer claim the second was saved.
let latest = 0

async function saveName () {
  const mine = ++latest
  const picked = options.value.find((o) => o.character === choice.value) ?? null
  const payload = namePayload(picked)
  save.value = 'saving'
  try {
    await api.updateUser(payload)
    if (mine !== latest) return
    save.value = 'saved'
    user.value = { ...user.value, ...payload }
    // Keep the account record the rest of the site holds in step.
    if (auth.user) auth.user = { ...auth.user, ...payload }
  } catch {
    if (mine !== latest) return
    save.value = 'failed'
  }
}
</script>

<template>
  <PageShell>
    <RouterLink class="settings__back" :to="{ name: 'profile' }">{{ t('profileBack') }}</RouterLink>

    <AppPanel>
      <h1 class="settings__title">{{ t('profileSettingsTitle') }}</h1>

      <p v-if="status === 'loading'" class="settings__state" role="status">{{ t('profileLoading') }}</p>

      <div v-else-if="status === 'error'" class="settings__state" role="alert">
        <p>{{ t('profileError') }}</p>
        <AppButton variant="seal" @click="load">{{ t('profileRetry') }}</AppButton>
      </div>

      <form v-else class="settings__form" @submit.prevent="saveName">
        <dl class="settings__field">
          <dt class="label">{{ t('email') }}</dt>
          <dd class="settings__email">{{ user.email_address }}</dd>
        </dl>

        <div class="settings__field">
          <label class="label" for="settings-name">{{ t('profileName') }}</label>
          <select
            id="settings-name"
            v-model="choice"
            class="settings__select"
            aria-describedby="settings-save"
            @change="saveName"
          >
            <option :value="NOT_SET">{{ t('profileNameNone') }}</option>
            <option v-for="option in options" :key="option.character" :value="option.character">
              {{ optionLabel(option) }}
            </option>
          </select>
        </div>

        <p id="settings-save" class="settings__save" :class="{ 'settings__save--bad': save === 'failed' }" role="status">
          <template v-if="save === 'saving'">{{ t('profileSaving') }}</template>
          <template v-else-if="save === 'saved'">{{ t('profileSaved') }}</template>
          <template v-else-if="save === 'failed'">{{ t('profileSaveFailed') }}</template>
        </p>
        <div v-if="save === 'failed'">
          <AppButton type="submit" variant="quiet" shape="sm">{{ t('profileSaveRetry') }}</AppButton>
        </div>
      </form>

      <div v-if="status === 'ready' && push !== 'off'" class="settings__field settings__push">
        <h2 class="label">{{ t('pushHeading') }}</h2>
        <label v-if="push === 'ok'" class="settings__switch">
          <input type="checkbox" role="switch" :checked="pushOn" :disabled="pushBusy" @change="togglePush">
          <span>{{ t('pushToggle') }}</span>
        </label>
        <p v-if="push === 'install'" class="settings__hint">{{ t('pushInstall') }}</p>
        <p v-else-if="push === 'blocked'" class="settings__hint">{{ t('pushBlocked') }}</p>
        <p v-else class="settings__hint">{{ t('pushNote') }}</p>
        <p v-if="pushError" class="settings__save settings__save--bad" role="alert">{{ t(pushError) }}</p>
      </div>

      <div v-if="status === 'ready'" id="public" class="settings__field settings__push">
        <h2 class="label">{{ t('publicHeading') }}</h2>
        <label class="settings__switch">
          <input type="checkbox" role="switch" :checked="Boolean(user.public_profile)" :disabled="publicBusy" @change="togglePublic">
          <span>{{ t('publicToggle') }}</span>
        </label>
        <p class="settings__hint">{{ t('publicNote') }}</p>
        <p v-if="user.public_profile && user.public_handle" class="settings__links">
          <RouterLink :to="{ name: 'public-profile', params: { handle: user.public_handle } }">{{ t('publicSee') }}</RouterLink>
          <RouterLink :to="{ name: 'leaderboard' }">{{ t('leaderboardTitle') }}</RouterLink>
        </p>
        <p v-if="publicError" class="settings__save settings__save--bad" role="alert">{{ t('publicFailed') }}</p>
      </div>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.settings__back { align-self: flex-start; font-size: var(--t-base); }
.settings__title { font-size: var(--t-xl); }

.settings__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  color: var(--c-body);
}

.settings__form { display: flex; flex-direction: column; gap: var(--s-6); }
.settings__field { display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; }

.settings__field:is(dl) { margin: 0; }
.settings__email { margin: 0; color: var(--c-ink); overflow-wrap: anywhere; }

.settings__select {
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
  min-width: 0;
}

.settings__save { min-height: 1.4em; font-size: var(--t-base); font-weight: var(--w-semi); color: var(--c-seal); }
.settings__save--bad { color: var(--c-red); font-weight: var(--w-body); }

.settings__push { padding-top: var(--s-6); border-top: var(--bw-rule) solid var(--c-rule); }
.settings__push h2 { margin: 0; }
.settings__links { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-4); margin: 0; font-size: var(--t-base); }
.settings__hint { margin: 0; font-size: var(--t-base); color: var(--c-body); }

.settings__switch { display: flex; align-items: center; gap: var(--s-3); color: var(--c-ink); cursor: pointer; }
.settings__switch input {
  appearance: none;
  flex: none;
  width: 2.75rem;
  height: 1.5rem;
  margin: 0;
  border-radius: 999px;
  background: var(--c-muted);
  position: relative;
  cursor: pointer;
  transition: background-color 0.15s;
}
.settings__switch input::after {
  content: '';
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: var(--c-raised);
  transition: transform 0.15s;
}
.settings__switch input:checked { background: var(--c-seal); }
.settings__switch input:checked::after { transform: translateX(1.25rem); }
.settings__switch input:focus-visible { outline: 2px solid var(--c-ink); outline-offset: 2px; }
.settings__switch input:disabled { opacity: 0.6; }
@media (prefers-reduced-motion: reduce) {
  .settings__switch input, .settings__switch input::after { transition: none; }
}
</style>
