<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import { api } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { catalogue, readUnsubLink, looksLikeEmail, unsubPayload, uniqueId } from '../lib/lists'

// Unsubscribe without signing in: an address and one list, or every list.
//
// Every daily email links here as /unsub?list=<list_id>&char=<set>&email=<address>
// (vocab: send_daily_email/app.py), so those three parameters are a contract
// with mail already sitting in inboxes. They fill in the form and are then
// taken out of the address bar, as before, so the address does not linger in
// history or get shared with a copied link.
//
// POST /unsub is public and answers { success: true } whether or not anyone is
// subscribed at that address, so this screen cannot and does not say which.

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const prefs = usePreferencesStore()

const email = ref('')
const choice = ref('')
const all = ref(false)
const fromLink = ref(null) // a list named in the link that is not an HSK list
const status = ref('idle') // idle | sending | invalid | done | error
const emailField = ref(null)

const options = computed(() => {
  const lists = catalogue(undefined, prefs.characterSet)
  return fromLink.value ? [fromLink.value, ...lists] : lists
})
const chosen = computed(() => options.value.find((o) => o.unique_list_id === choice.value) ?? null)
const setName = (list) => t(list.character_set === 'traditional' ? 'listsTraditional' : 'listsSimplified')
const optionLabel = (list) => `${list.list_name || t('unsubEmailedList')} · ${setName(list)}`
const farewell = computed(() => (prefs.isTraditional ? '希望我們後會有期！' : '希望我们后会有期！'))
const manageLink = computed(() => (auth.signedIn ? { name: 'manage-lists' } : { name: 'signin' }))

onMounted(() => {
  const { email: address, list } = readUnsubLink(route.query)
  email.value = address
  if (list) {
    // The link's character set is the one the reader studies in; App.vue
    // applies it too, but this screen strips it from the URL straight away.
    prefs.applyFromQuery({ char: list.character_set })
    if (!list.list_name) fromLink.value = list
    choice.value = uniqueId(list)
  } else {
    choice.value = options.value[0].unique_list_id
  }

  if (['email', 'list', 'char'].some((k) => k in route.query)) {
    const query = { ...route.query }
    delete query.email
    delete query.list
    delete query.char
    router.replace({ query })
  }
})

async function submit () {
  if (status.value === 'sending') return
  if (!looksLikeEmail(email.value)) {
    status.value = 'invalid'
    await nextTick()
    emailField.value?.focus()
    return
  }
  status.value = 'sending'
  try {
    const { data } = await api.unsubscribe(unsubPayload({ email: email.value, list: chosen.value, all: all.value }))
    status.value = data?.success === true ? 'done' : 'error'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <PageShell>
    <AppPanel>
      <h1 class="unsub__title">{{ t('unsubTitle') }}</h1>

      <form class="unsub__form" novalidate @submit.prevent="submit">
        <div class="unsub__field">
          <label class="label" for="unsub-email">{{ t('email') }}</label>
          <input
            id="unsub-email"
            ref="emailField"
            v-model="email"
            class="unsub__input"
            type="email"
            autocomplete="email"
            inputmode="email"
            placeholder="you@example.com"
            :disabled="status === 'sending'"
            :aria-invalid="status === 'invalid'"
            aria-describedby="unsub-msg"
          />
        </div>

        <div class="unsub__field">
          <label class="label" for="unsub-list">{{ t('unsubList') }}</label>
          <select id="unsub-list" v-model="choice" class="unsub__input" :disabled="all || status === 'sending'">
            <option v-for="list in options" :key="list.unique_list_id" :value="list.unique_list_id">
              {{ optionLabel(list) }}
            </option>
          </select>
        </div>

        <label class="unsub__all">
          <input v-model="all" type="checkbox" :disabled="status === 'sending'" />
          <span>{{ t('unsubAll') }}</span>
        </label>

        <AppButton variant="seal" type="submit" :disabled="status === 'sending'">
          {{ status === 'sending' ? t('unsubSending') : t('unsubSubmit') }}
        </AppButton>
      </form>

      <p id="unsub-msg" class="unsub__msg unsub__msg--bad" role="alert">
        <template v-if="status === 'invalid'">{{ t('unsubInvalid') }}</template>
        <template v-else-if="status === 'error'">{{ t('unsubError', { address: 'contact@haohaotiantian.com' }) }}</template>
      </p>
      <p class="unsub__msg" role="status">
        <template v-if="status === 'done'">
          {{ t('unsubDone') }} <span class="hanzi unsub__farewell" lang="zh">{{ farewell }}</span>
        </template>
      </p>

      <p class="unsub__aside">
        <RouterLink :to="manageLink">{{ t('unsubManage') }}</RouterLink>
      </p>
    </AppPanel>
  </PageShell>
</template>

<style scoped>
.unsub__title { font-size: var(--t-xl); }

.unsub__form { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); }
.unsub__field { display: flex; flex-direction: column; gap: var(--s-2); width: 100%; }

.unsub__input {
  width: 100%;
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body-lg);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
}
.unsub__input:disabled { background-color: var(--c-sunk); color: var(--c-muted); }

.unsub__all { display: flex; align-items: center; gap: var(--s-2); color: var(--c-ink); cursor: pointer; }
.unsub__all input { width: 1.125rem; height: 1.125rem; margin: 0; accent-color: var(--c-ink); }

.unsub__msg { font-size: var(--t-body); color: var(--c-ink); font-weight: var(--w-semi); }
.unsub__msg:empty { position: absolute; }
.unsub__msg--bad { color: var(--c-red); font-weight: var(--w-body); }
.unsub__farewell { font-size: var(--t-md); font-weight: var(--w-body); }
.unsub__aside { font-size: var(--t-base); }
</style>
