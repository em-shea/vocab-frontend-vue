<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import QuizSettings from '../components/quiz/QuizSettings.vue'
import QuizQuestion from '../components/quiz/QuizQuestion.vue'
import QuizResults from '../components/quiz/QuizResults.vue'
import { api } from '../api/client'
import { useVocabListsStore } from '../stores/vocabLists'
import { usePreferencesStore } from '../stores/preferences'
import { useAuthStore } from '../stores/auth'
import { RANGES, LENGTHS, DEFAULTS, uniqueWords, canQuiz, makeQuestion, resultsPayload } from '../lib/quiz'

// A multiple-choice quiz on the words a list was sent recently.
//
// The settings live in the URL with the Vue 2 app's parameter names
// (?list_id=…&date_range=…&ques=…), because the daily email links here and
// people bookmark a favourite quiz. ?char= is handled site-wide in App.vue.
//
// The question rules are in lib/quiz.js; this file only runs the session.

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const lists = useVocabListsStore()
const prefs = usePreferencesStore()
const auth = useAuthStore()

const HSK1 = '1ebcad3f-5dfd-6bfe-bda4-acde48001122'

const listId = ref(HSK1)
const range = ref(DEFAULTS.range)
const length = ref(DEFAULTS.length)

const words = ref([])
const status = ref('loading') // loading | error | too-few | asking | done
const settingsOpen = ref(false)

const question = ref(null)
const number = ref(1)
const answers = ref([])
const save = ref('signed-out') // signed-out | saving | saved | failed
const results = ref(null)

let latest = 0

async function load () {
  const mine = ++latest
  status.value = 'loading'
  try {
    const { data } = await api.reviewWords({ listId: listId.value, dateRange: range.value })
    if (mine !== latest) return
    words.value = uniqueWords(data?.[listId.value] ?? [])
    start()
  } catch {
    if (mine !== latest) return
    words.value = []
    status.value = 'error'
  }
}

function start () {
  number.value = 1
  answers.value = []
  save.value = 'signed-out'
  if (!canQuiz(words.value)) {
    status.value = 'too-few'
    return
  }
  question.value = makeQuestion(words.value, { characterSet: prefs.characterSet })
  status.value = 'asking'
}

function record ({ chosen, correct }) {
  answers.value.push({ answer: question.value.answer, chosen, correct, type: question.value.type })
}

async function next () {
  if (number.value < length.value) {
    number.value++
    question.value = makeQuestion(words.value, { previous: question.value.answer, characterSet: prefs.characterSet })
    return
  }
  status.value = 'done'
  await nextTick()
  results.value?.$el?.querySelector('h2')?.focus()
  submit()
}

async function submit () {
  if (!auth.signedIn) {
    save.value = 'signed-out'
    return
  }
  save.value = 'saving'
  try {
    await api.saveQuiz(resultsPayload({
      listId: listId.value,
      characterSet: prefs.characterSet,
      range: range.value,
      length: length.value,
      answers: answers.value
    }))
    save.value = 'saved'
  } catch {
    save.value = 'failed'
  }
}

function syncUrl () {
  const query = { ...route.query, list_id: listId.value, date_range: String(range.value), ques: String(length.value) }
  if (['list_id', 'date_range', 'ques'].every((k) => route.query[k] === query[k])) return
  router.replace({ query })
}

function applySettings (choice) {
  settingsOpen.value = false
  const sameWords = choice.listId === listId.value && choice.range === range.value
  listId.value = choice.listId
  range.value = choice.range
  length.value = choice.length
  syncUrl()
  if (sameWords && words.value.length) start()
  else load()
}

onMounted(async () => {
  // Anything unrecognised in a link keeps the default rather than sending a
  // nonsense request.
  const wantedRange = Number(route.query.date_range)
  if (RANGES.includes(wantedRange)) range.value = wantedRange
  const wantedLength = Number(route.query.ques)
  if (LENGTHS.includes(wantedLength)) length.value = wantedLength

  await lists.load()
  const wantedList = typeof route.query.list_id === 'string' ? route.query.list_id : null
  if (wantedList && lists.byId(wantedList)) listId.value = wantedList
  else if (!lists.byId(listId.value) && lists.all.length) listId.value = lists.all[0].list_id

  syncUrl()
  await load()
})

const listName = computed(() => lists.byId(listId.value)?.list_name ?? '')
const correctCount = computed(() => answers.value.filter((a) => a.correct).length)
// Fills as questions are answered, so the last answer completes the bar.
const progress = computed(() => Math.round((answers.value.length / length.value) * 100))
const reviewLink = computed(() => ({ name: 'review', query: { list_id: listId.value } }))
</script>

<template>
  <PageShell width="wide">
    <div class="quiz">
      <div class="quiz__intro">
        <h1 class="quiz__title">{{ listName ? t('quizTitle', { list: listName }) : t('navQuiz') }}</h1>
        <AppButton
          v-if="!settingsOpen"
          class="quiz__change"
          variant="quiet"
          shape="sm"
          :aria-expanded="settingsOpen"
          @click="settingsOpen = true"
        >
          {{ t('quizChange') }}
        </AppButton>
      </div>

      <QuizSettings
        v-if="settingsOpen"
        :lists="lists.all"
        :list-id="listId"
        :range="range"
        :length="length"
        @start="applySettings"
        @cancel="settingsOpen = false"
      />

      <p v-if="status === 'loading'" class="quiz__state" role="status">{{ t('quizLoading') }}</p>

      <div v-else-if="status === 'error'" class="quiz__state" role="alert">
        <p>{{ t('quizError') }}</p>
        <AppButton variant="seal" @click="load">{{ t('quizRetry') }}</AppButton>
      </div>

      <p v-else-if="status === 'too-few'" class="quiz__state" role="status">{{ t('quizTooFew') }}</p>

      <template v-else-if="status === 'asking'">
        <div class="quiz__progress">
          <p class="label">{{ t('quizProgress', { n: number, total: length }) }}</p>
          <div
            class="quiz__bar"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="t('quizProgress', { n: number, total: length })"
          >
            <span :style="{ width: `${progress}%` }" />
          </div>
        </div>
        <QuizQuestion
          :question="question"
          :last="number === length"
          @answer="record"
          @next="next"
        />
      </template>

      <QuizResults
        v-else-if="status === 'done'"
        ref="results"
        :correct="correctCount"
        :total="length"
        :save="save"
        :review-link="reviewLink"
        @again="start"
        @retry-save="submit"
      />
    </div>
  </PageShell>
</template>

<style scoped>
.quiz { display: flex; flex-direction: column; gap: var(--s-6); max-width: 46rem; }

.quiz__intro { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-2); }
.quiz__title { font-size: var(--t-xl); }
.quiz__change { margin-top: var(--s-2); }

.quiz__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  padding: var(--s-8) 0;
  color: var(--c-body);
}

.quiz__progress { display: flex; flex-direction: column; gap: var(--s-2); }
.quiz__bar {
  height: 0.75rem;
  background-color: var(--c-sunk);
  border: var(--bw-rule) solid var(--c-ink);
}
.quiz__bar > span {
  display: block;
  height: 100%;
  background-color: var(--c-red-solid);
  transition: width 200ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .quiz__bar > span { transition: none; }
}
</style>
