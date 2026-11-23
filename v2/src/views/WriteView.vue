<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { signInRoute } from '../lib/signInReturn'

import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import TaskBox from '../components/TaskBox.vue'
import CharacterPractice from '../components/write/CharacterPractice.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { usePreferencesStore } from '../stores/preferences'
import { activityFrom, todaysWords } from '../lib/sentences'
import { charactersOf, writingPayload } from '../lib/writing'
import { useListLabel } from '../lib/listLabel'
import { useDefinition } from '../lib/cnDefinitions'

// Handwriting practice (Emily, 2026-11-23): write each character of today's
// words stroke by stroke. A word counts once all its characters are written;
// that is saved (POST /writing) and ticks off the Writing task on the profile.
// Signed-in only; behind WRITING_ENABLED (featureFlags.js, router).

const { t } = useI18n()
const route = useRoute()
const prefs = usePreferencesStore()
const listLabel = useListLabel()
const definitionOf = useDefinition()

const status = ref('loading') // loading | signed-out | error | ready
const words = ref([])
const subscriptions = ref([])
const written = reactive({}) // key -> Set of characters written this visit
const saved = reactive({}) // key -> idle | saving | saved | failed

const keyOf = (entry) => `${entry.date_sent}|${entry.list_id}|${entry.word.word_id ?? entry.word.simplified}`

// Like the profile's cards: a word follows its list's character set when the
// list is taken in one set, otherwise the site setting.
function traditionalFor (listId) {
  const sets = new Set(subscriptions.value.filter((s) => s.list_id === listId).map((s) => s.character_set))
  return sets.size === 1 ? sets.has('traditional') : prefs.isTraditional
}
const charsOf = (entry) => charactersOf(entry.word, traditionalFor(entry.list_id))
const listName = (id) => listLabel(subscriptions.value.find((s) => s.list_id === id)?.list_name ?? '')

// Box size: fits two side by side on a phone.
const width = ref(typeof window === 'undefined' ? 1024 : window.innerWidth)
const onResize = () => { width.value = window.innerWidth }
const boxSize = computed(() => (width.value < 480 ? Math.floor((width.value - 48) / 2) : 200))

async function load () {
  status.value = 'loading'
  if (!(await getSession())) { status.value = 'signed-out'; return }
  try {
    const res = await api.userActivity()
    const body = res.data?.activity ? res.data : (res.data?.data ?? {})
    subscriptions.value = body.subscriptions ?? []
    words.value = todaysWords(activityFrom(res.data))
    for (const entry of words.value) {
      written[keyOf(entry)] = new Set()
      saved[keyOf(entry)] = entry.written ? 'saved' : 'idle'
    }
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

async function save (entry) {
  const key = keyOf(entry)
  saved[key] = 'saving'
  try {
    await api.saveWriting(writingPayload(entry, traditionalFor(entry.list_id) ? 'traditional' : 'simplified'))
    saved[key] = 'saved'
  } catch {
    saved[key] = 'failed'
  }
}

function charDone (entry, char) {
  const key = keyOf(entry)
  written[key].add(char)
  // Every character written: the word is done. Saved once per visit.
  if (charsOf(entry).every((c) => written[key].has(c)) && saved[key] === 'idle') save(entry)
}

onMounted(() => { window.addEventListener('resize', onResize); load() })
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <PageShell>
    <h1 class="write__title">{{ t('writeTitle') }}</h1>

    <p v-if="status === 'loading'" class="write__state" role="status">{{ t('sentencesLoading') }}</p>

    <div v-else-if="status === 'signed-out'" class="write__state">
      <p>{{ t('writeSignIn') }}</p>
      <AppButton as="RouterLink" :to="signInRoute(route.fullPath)" variant="seal">{{ t('navSignIn') }}</AppButton>
    </div>

    <div v-else-if="status === 'error'" class="write__state" role="alert">
      <p>{{ t('sentencesError') }}</p>
      <AppButton variant="seal" @click="load">{{ t('sentencesRetry') }}</AppButton>
    </div>

    <template v-else>
      <p v-if="!words.length" class="write__state">{{ t('sentencesNoWords') }}</p>
      <section v-for="entry in words" :key="keyOf(entry)" class="word" :aria-labelledby="`write-${keyOf(entry)}`">
        <header class="word__head">
          <div>
            <p class="label">{{ listName(entry.list_id) }}</p>
            <h2 :id="`write-${keyOf(entry)}`" class="word__title">
              <span class="hanzi" lang="zh">{{ charsOf(entry).join('') }}</span>
              <span class="pinyin word__pinyin">{{ entry.word.pinyin }}</span>
            </h2>
            <p class="word__definition">{{ definitionOf(entry.word) }}</p>
          </div>
          <p class="word__status" role="status">
            <template v-if="saved[keyOf(entry)] === 'saved'"><TaskBox done /> {{ t('writeWordDone') }}</template>
            <template v-else-if="saved[keyOf(entry)] === 'saving'">{{ t('profileSaving') }}</template>
            <template v-else-if="saved[keyOf(entry)] === 'failed'">
              {{ t('writeSaveFailed') }}
              <button type="button" class="word__retry" @click="save(entry)">{{ t('sentencesRetry') }}</button>
            </template>
          </p>
        </header>
        <div class="word__chars">
          <CharacterPractice
            v-for="char in charsOf(entry)"
            :key="char"
            :char="char"
            :size="boxSize"
            @done="charDone(entry, char)"
          />
        </div>
      </section>
    </template>
  </PageShell>
</template>

<style scoped>
.write__title { font-size: var(--t-2xl); line-height: var(--lh-tight); margin-bottom: var(--s-8); }
.write__state { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); }

.word { padding: var(--s-8) 0; border-top: var(--bw-hair) solid var(--c-rule); }
.word__head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: var(--s-4); margin-bottom: var(--s-6); }
.word__title { display: flex; align-items: baseline; gap: var(--s-4); margin-top: var(--s-2); font-size: var(--t-2xl); }
.word__pinyin { font-size: var(--t-body); font-weight: var(--w-regular, 400); }
.word__definition { margin-top: var(--s-2); color: var(--c-body); }
.word__status { display: flex; align-items: center; gap: var(--s-2); min-height: 1.5rem; color: var(--c-ink); }
.word__retry { padding: 0; font: inherit; color: var(--c-red); background: none; border: 0; text-decoration: underline; cursor: pointer; }
.word__chars { display: flex; flex-wrap: wrap; gap: var(--s-8); }
@media (max-width: 479px) { .word__chars { gap: var(--s-4); justify-content: space-between; } }
</style>
