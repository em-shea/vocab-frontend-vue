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

// Profile settings: the learner's email, and the name the profile shows.
// Like the old screen, a new name is saved as soon as it is chosen
// (POST /update_user).
//
// Two of the old screen's settings are not here. Character set is chosen
// site-wide from the globe menu, which already saves it to the account. The
// emoji avatar has gone with emoji from the site; the stored value is left
// untouched, because only the name fields are sent.

const { t } = useI18n()
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
})

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
              {{ option.character }} {{ option.pinyin }}
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
</style>
