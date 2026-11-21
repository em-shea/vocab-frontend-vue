<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { signInRoute } from '../lib/signInReturn'

import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import SentenceWrite from '../components/sentences/SentenceWrite.vue'
import SentenceList from '../components/sentences/SentenceList.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { usePreferencesStore } from '../stores/preferences'
import {
  todaysWords, wordsBySentenceId, activityFrom, sentencesFrom, newestFirst, upsert,
  clean, newSentenceId, savePayload, todayKey
} from '../lib/sentences'

// Practice sentences: write a sentence with each of today's words, and read
// back the ones written before. Signed-in only. Held behind SENTENCES_ENABLED
// (see featureFlags.js and the router).
//
// The rules, and why only today's words can be written for, are in
// lib/sentences.js; this file loads, saves and keeps the page in step.

const { t } = useI18n()
const route = useRoute()
const prefs = usePreferencesStore()

const status = ref('loading') // loading | signed-out | error | ready
const today = ref(null)
const words = ref([])
const sentences = ref([])
const sentenceWords = ref({})
// Per word, keyed like the cards: the saved text and its id, and how the
// last save went.
const saved = reactive({})
const saving = reactive({})
// The id each word's sentence is saved under. Chosen once, on the first try,
// so a retry after a failed save cannot file the same sentence twice.
const ids = {}

const keyOf = (entry) => `${entry.list_id}|${entry.word.word_id ?? entry.word.simplified}`
const heading = ref(null)

async function load () {
  status.value = 'loading'
  // App.vue restores the session after this screen has mounted, so ask
  // Cognito directly rather than wait on the store.
  if (!(await getSession())) {
    status.value = 'signed-out'
    return
  }
  try {
    const [activityRes, sentencesRes] = await Promise.all([api.userActivity(), api.sentences()])
    const activity = activityFrom(activityRes.data)
    today.value = todayKey(activity)
    words.value = todaysWords(activity)
    sentenceWords.value = wordsBySentenceId(activity)
    sentences.value = newestFirst(sentencesFrom(sentencesRes.data))
    for (const entry of words.value) {
      const key = keyOf(entry)
      saved[key] = entry.sentence
        ? { id: entry.sentence.sentence_id, text: entry.sentence.sentence }
        : { id: '', text: '' }
      saving[key] = 'idle'
      ids[key] = saved[key].id
    }
    status.value = 'ready'
  } catch (err) {
    // An expired session reaches the API as a 401: treat it as signed out.
    status.value = err?.response?.status === 401 ? 'signed-out' : 'error'
  }
}

async function retry () {
  await load()
  await nextTick()
  heading.value?.focus()
}

async function save (entry, text) {
  const key = keyOf(entry)
  if (saving[key] === 'saving') return
  if (!clean(text)) {
    saving[key] = 'empty'
    return
  }
  ids[key] ||= newSentenceId()
  const id = ids[key]
  saving[key] = 'saving'
  try {
    const payload = savePayload({ entry, text, sentenceId: id, characterSet: prefs.characterSet })
    await api.saveSentence(payload)
    saved[key] = { id, text: payload.sentence }
    // The server files it under its own today, the newest day in the activity.
    sentences.value = upsert(sentences.value, {
      sentence_id: id,
      sentence: payload.sentence,
      character_set: payload.character_set,
      date_created: today.value
    })
    sentenceWords.value = { ...sentenceWords.value, [id]: entry.word }
    saving[key] = 'saved'
  } catch {
    saving[key] = 'failed'
  }
}

onMounted(load)

const hasWords = computed(() => words.value.length > 0)
</script>

<template>
  <PageShell>
    <h1 ref="heading" class="sentences__title" tabindex="-1">{{ t('sentencesTitle') }}</h1>

    <p v-if="status === 'loading'" class="sentences__state" role="status">{{ t('sentencesLoading') }}</p>

    <div v-else-if="status === 'signed-out'" class="sentences__state">
      <p>{{ t('sentencesSignIn') }}</p>
      <AppButton as="RouterLink" :to="signInRoute(route.fullPath)" variant="seal">{{ t('navSignIn') }}</AppButton>
    </div>

    <div v-else-if="status === 'error'" class="sentences__state" role="alert">
      <p>{{ t('sentencesError') }}</p>
      <AppButton variant="seal" @click="retry">{{ t('sentencesRetry') }}</AppButton>
    </div>

    <template v-else>
      <section class="sentences__section" aria-labelledby="sentences-today">
        <h2 id="sentences-today" class="sentences__heading">{{ t('sentencesToday') }}</h2>
        <ul v-if="hasWords" class="sentences__words">
          <li v-for="entry in words" :key="keyOf(entry)">
            <SentenceWrite
              :entry="entry"
              :saved="saved[keyOf(entry)].text"
              :status="saving[keyOf(entry)]"
              @save="(text) => save(entry, text)"
              @edit="saving[keyOf(entry)] = 'idle'"
            />
          </li>
        </ul>
        <p v-else class="sentences__empty">{{ t('sentencesNoWords') }}</p>
      </section>

      <section class="sentences__section" aria-labelledby="sentences-written">
        <h2 id="sentences-written" class="sentences__heading">{{ t('sentencesWritten') }}</h2>
        <SentenceList :sentences="sentences" :words="sentenceWords" />
      </section>
    </template>
  </PageShell>
</template>

<style scoped>
.sentences__title { font-size: var(--t-xl); outline: none; }

.sentences__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  padding: var(--s-4) 0;
  color: var(--c-body);
}

.sentences__section { display: flex; flex-direction: column; gap: var(--s-4); }
.sentences__section + .sentences__section { margin-top: var(--s-6); }
.sentences__heading { font-size: var(--t-lg); }

.sentences__words { display: flex; flex-direction: column; gap: var(--s-6); margin: 0; padding: 0; list-style: none; }

.sentences__empty { color: var(--c-body); }
</style>
