<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import SectionHead from '../components/SectionHead.vue'
import AppButton from '../components/AppButton.vue'
import WordCard from '../components/WordCard.vue'
import { api } from '../api/client'
import { useVocabListsStore } from '../stores/vocabLists'
import { usePreferencesStore } from '../stores/preferences'
import { toCsv, downloadCsv } from '../lib/csv'

// Every word sent for one list over the past 30, 60 or 90 days, newest first.
//
// The list and range live in the URL (?list_id=…&date_range=…), because the
// daily email links straight to a level's history and people bookmark it. The
// character set rides alongside as ?char=…, handled by the preferences store.

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const lists = useVocabListsStore()
const prefs = usePreferencesStore()

const RANGES = [30, 60, 90]
const HSK1 = '1ebcad3f-5dfd-6bfe-bda4-acde48001122'

const listId = ref(HSK1)
const range = ref(30)
const words = ref([])
const status = ref('loading') // loading | ready | error

// Only the latest request may write its result: switching list twice quickly
// must not let the slower first answer overwrite the second.
let latest = 0

async function load () {
  const mine = ++latest
  status.value = 'loading'
  try {
    const { data } = await api.reviewWords({ listId: listId.value, dateRange: range.value })
    if (mine !== latest) return
    // The API returns oldest first, keyed by list id.
    words.value = (data?.[listId.value] ?? []).slice().reverse()
    status.value = 'ready'
  } catch {
    if (mine !== latest) return
    words.value = []
    status.value = 'error'
  }
}

function syncUrl () {
  const query = { ...route.query, list_id: listId.value, date_range: String(range.value) }
  if (route.query.list_id === query.list_id && route.query.date_range === query.date_range) return
  // replace, not push: changing a dropdown should not fill the back button
  // with one entry per choice.
  router.replace({ query })
}

onMounted(async () => {
  // A link may name a range or list; anything unrecognised keeps the default
  // rather than sending a nonsense request.
  const wantedRange = Number(route.query.date_range)
  if (RANGES.includes(wantedRange)) range.value = wantedRange

  await lists.load()
  const wantedList = typeof route.query.list_id === 'string' ? route.query.list_id : null
  if (wantedList && lists.byId(wantedList)) listId.value = wantedList
  else if (!lists.byId(listId.value) && lists.all.length) listId.value = lists.all[0].list_id

  syncUrl()
  await load()

  // Watch only after the first load, so setting the initial values above does
  // not fire a second, identical request.
  watch([listId, range], () => { syncUrl(); load() })
})

const listName = computed(() => lists.byId(listId.value)?.list_name ?? '')

const dateFormat = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
)
function shortDate (iso) {
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.value.format(date)
}

// Simple sentences for the lower levels, a fuller dictionary for the upper
// ones. Same two sites and the same HSK 3 cut-off the old screen used.
function examplesUrl (word) {
  const term = encodeURIComponent(word.simplified ?? '')
  return Number(word.hsk_level) > 3
    ? `https://fanyi.baidu.com/#zh/en/${term}`
    : `https://www.yellowbridge.com/chinese/sentsearch.php?word=${term}`
}

function exportWords () {
  const rows = words.value.map((entry) => ({
    date_sent: entry.date_sent,
    simplified: entry.word.simplified,
    traditional: entry.word.traditional,
    pinyin: entry.word.pinyin,
    definition: entry.word.definition,
    difficulty_level: entry.word.difficulty_level,
    hsk_level: entry.word.hsk_level
  }))
  const columns = ['date_sent', 'simplified', 'traditional', 'pinyin', 'definition', 'difficulty_level', 'hsk_level']
  downloadCsv(`Chinese vocab words, past ${range.value} days.csv`, toCsv(rows, columns))
}
</script>

<template>
  <PageShell width="wide">
    <SectionHead :label="t('reviewMark')" />

    <div class="review__intro">
      <h1 class="review__title">{{ t('reviewTitle') }}</h1>
      <p>{{ t('reviewBody') }}</p>
    </div>

    <form class="review__controls" @submit.prevent>
      <div class="review__field">
        <label class="label" for="review-list">{{ t('reviewList') }}</label>
        <select id="review-list" v-model="listId" class="review__select">
          <option v-for="list in lists.all" :key="list.list_id" :value="list.list_id">{{ list.list_name }}</option>
        </select>
      </div>

      <div class="review__field">
        <label class="label" for="review-range">{{ t('reviewRange') }}</label>
        <select id="review-range" v-model.number="range" class="review__select">
          <option v-for="days in RANGES" :key="days" :value="days">{{ t(`reviewRange${days}`) }}</option>
        </select>
      </div>

      <AppButton
        class="review__export"
        variant="primary"
        :title="t('reviewExportHint')"
        :disabled="status !== 'ready' || !words.length"
        @click="exportWords"
      >
        {{ t('reviewExport') }}
      </AppButton>
    </form>

    <p v-if="status === 'loading'" class="review__state" role="status">{{ t('reviewLoading') }}</p>

    <div v-else-if="status === 'error'" class="review__state" role="alert">
      <p>{{ t('reviewError') }}</p>
      <AppButton variant="seal" @click="load">{{ t('reviewRetry') }}</AppButton>
    </div>

    <p v-else-if="!words.length" class="review__state" role="status">{{ t('reviewEmpty') }}</p>

    <template v-else>
      <p class="label review__count" role="status">{{ listName }} · {{ t('reviewCount', { count: words.length }) }}</p>
      <ul class="review__grid">
        <li v-for="entry in words" :key="entry.list_id + entry.date_sent">
          <WordCard
            :word="entry.word"
            :date="shortDate(entry.date_sent)"
            :level="entry.word.hsk_level ? t('reviewLevel', { level: entry.word.hsk_level }) : ''"
            compact
          >
            <a class="review__examples" :href="examplesUrl(entry.word)" target="_blank" rel="noopener">
              {{ t('reviewExamples') }}
            </a>
          </WordCard>
        </li>
      </ul>
    </template>
  </PageShell>
</template>

<style scoped>
.review__intro { display: flex; flex-direction: column; gap: var(--s-2); }
.review__title { font-size: var(--t-xl); }

.review__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  align-items: end;
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

.review__field { display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; }

.review__select {
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
  min-width: 0;
}

.review__export { justify-self: start; }

.review__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  padding: var(--s-8) 0;
  color: var(--c-body);
}

.review__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Cards in a row match the tallest, so the grid reads as rows, not a ragged wall. */
.review__grid > li { display: flex; }
.review__grid > li > * { flex: 1; }

.review__examples { font-size: var(--t-sm); margin-top: auto; }

@media (min-width: 720px) {
  .review__controls { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; }
  .review__export { justify-self: end; }
}
</style>
