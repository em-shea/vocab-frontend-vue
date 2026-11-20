<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import ListRow from '../components/lists/ListRow.vue'
import { getSession } from '../api/session'
import { api } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { catalogue, subscribed, available, adding, removing, subscriptionsPayload, uniqueId } from '../lib/lists'

// Which lists a subscriber's daily email carries, and in which character set.
//
// Reads the account from GET /user and saves with POST /subscriptions, which
// replaces the whole set. Each change is saved as it is made, as before.
//
// FIX: the Vue 2 screen changed the list on screen before saving and never
// looked at the answer, so a failed save still showed "Updated!". The screen
// now changes only once the save succeeds, and says so when it does not.
// FIX: signed out, the old screen threw and showed an empty page.

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const prefs = usePreferencesStore()

const status = ref('loading') // loading | signed-out | error | ready
const current = ref([])
const saving = ref(null) // unique id of the list being saved
const outcome = ref(null) // { kind: 'added' | 'removed' | 'failed', list }
const root = ref(null)

const extra = computed(() => available(catalogue(undefined, prefs.characterSet), current.value))
const backLink = computed(() => (router.hasRoute('profile') ? { name: 'profile' } : null))

// The app restores the session in App.vue, which mounts after this screen, so
// wait for it rather than reading a store that is not filled in yet.
async function load () {
  status.value = 'loading'
  if (!(await getSession())) {
    status.value = 'signed-out'
    return
  }
  try {
    if (!auth.user) {
      const { data } = await api.user()
      auth.user = data?.data ?? data
      auth.signedIn = true
    }
    current.value = subscribed(auth.user)
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

async function change (list, kind) {
  if (saving.value) return
  const next = kind === 'added' ? adding(current.value, list) : removing(current.value, list)
  saving.value = uniqueId(list)
  outcome.value = null
  try {
    await api.updateSubscriptions(subscriptionsPayload(next))
    current.value = next
    if (auth.user) auth.user = { ...auth.user, subscriptions: next }
    outcome.value = { kind, list }
    saving.value = null
    // The row has moved to the other section; follow it there so keyboard
    // users can carry on (or undo) from where they were.
    await nextTick()
    root.value?.querySelector(`[data-list="${uniqueId(list)}"] button`)?.focus()
  } catch {
    outcome.value = { kind: 'failed', list }
  } finally {
    saving.value = null
  }
}

const setName = (list) => t(list.character_set === 'traditional' ? 'listsTraditional' : 'listsSimplified')
const message = computed(() => {
  if (!outcome.value) return ''
  const { kind, list } = outcome.value
  const vars = { list: list.list_name || t('listsUnnamed'), set: setName(list) }
  if (kind === 'added') return t('listsAdded', vars)
  if (kind === 'removed') return t('listsRemoved', vars)
  return t('listsSaveFailed')
})

onMounted(load)
</script>

<template>
  <PageShell>
    <div ref="root" class="lists">
      <RouterLink v-if="backLink" class="lists__back" :to="backLink">{{ t('listsBack') }}</RouterLink>
      <h1 class="lists__title">{{ t('listsTitle') }}</h1>

      <p v-if="status === 'loading'" role="status">{{ t('listsLoading') }}</p>

      <div v-else-if="status === 'signed-out'" class="lists__state">
        <p>{{ t('listsSignedOut') }}</p>
        <AppButton as="RouterLink" variant="seal" :to="{ name: 'signin' }">{{ t('navSignIn') }}</AppButton>
      </div>

      <div v-else-if="status === 'error'" class="lists__state" role="alert">
        <p>{{ t('listsError') }}</p>
        <AppButton variant="seal" @click="load">{{ t('listsRetry') }}</AppButton>
      </div>

      <template v-else>
        <p class="lists__msg" role="status">{{ outcome?.kind === 'failed' ? '' : message }}</p>
        <p class="lists__msg lists__msg--bad" role="alert">{{ outcome?.kind === 'failed' ? message : '' }}</p>

        <section class="lists__section" aria-labelledby="lists-mine">
          <h2 id="lists-mine" class="lists__heading">{{ t('listsMine') }}</h2>
          <ul v-if="current.length" class="lists__rows">
            <ListRow
              v-for="list in current"
              :key="list.unique_list_id"
              :list="list"
              action="unsubscribe"
              :busy="saving === list.unique_list_id"
              :disabled="Boolean(saving)"
              @act="change($event, 'removed')"
            />
          </ul>
          <p v-else class="lists__empty">{{ t('listsNone') }}</p>
        </section>

        <section v-if="extra.length" class="lists__section" aria-labelledby="lists-more">
          <h2 id="lists-more" class="lists__heading">{{ t('listsMore') }}</h2>
          <ul class="lists__rows">
            <ListRow
              v-for="list in extra"
              :key="list.unique_list_id"
              :list="list"
              action="subscribe"
              :busy="saving === list.unique_list_id"
              :disabled="Boolean(saving)"
              @act="change($event, 'added')"
            />
          </ul>
        </section>
      </template>
    </div>
  </PageShell>
</template>

<style scoped>
.lists { display: flex; flex-direction: column; gap: var(--s-6); }
.lists__back { align-self: flex-start; font-size: var(--t-base); }
.lists__title { font-size: var(--t-xl); }

.lists__state { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); }

.lists__msg { min-height: 1.6em; color: var(--c-ink); font-weight: var(--w-semi); }
/* Empty, it stays in the page so screen readers hear what fills it, but takes
 * no room: out of flow, it adds no gap either. */
.lists__msg:empty { position: absolute; min-height: 0; }
.lists__msg--bad { color: var(--c-red); }

.lists__section { display: flex; flex-direction: column; gap: var(--s-3); }
.lists__heading { font-size: var(--t-lg); }
.lists__rows { display: flex; flex-direction: column; gap: var(--s-2); margin: 0; padding: 0; list-style: none; }
.lists__empty { color: var(--c-body); }
</style>
