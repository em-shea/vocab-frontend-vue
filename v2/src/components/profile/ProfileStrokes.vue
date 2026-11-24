<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import DoneCount from './DoneCount.vue'
import AppButton from '../AppButton.vue'
import TaskBox from '../TaskBox.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { recentDays } from '../../lib/sentences'

// Stroke order at a glance (Emily, 2026-11-23), laid out like the Quizzes and
// Sentences boxes: each of today's words with a Practise button or a tick,
// then the earlier days' words already practised. Practice happens on /write.
// Shown only while WRITING_ENABLED is on (see ProfileView).
//
// Uses the same words as the word cards (wordProgress), so the count, the
// rows and the cards always agree.

const props = defineProps({
  progress: { type: Array, default: () => [] }, // lib/profile wordProgress
  count: { type: Object, default: () => ({ done: 0, total: 0 }) }, // { done, total } over today's words
  activity: { type: Object, default: () => ({}) } // for past practice
})
const { t, locale } = useI18n()
const prefs = usePreferencesStore()

const todayDate = computed(() => props.progress[0]?.entry.date_sent)
const past = computed(() => recentDays(props.activity)
  .filter((day) => day.date !== todayDate.value)
  .flatMap((day) => day.words.filter((e) => e.written === true).map((e) => ({ date: day.date, entry: e }))))
const shortDate = (date) => {
  const [y, m, d] = String(date).split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)))
}
const characters = (word) => (prefs.isTraditional ? word.traditional : word.simplified) || word.simplified
</script>

<template>
  <section class="strokes" aria-labelledby="profile-strokes">
    <SectionHead>
      <span id="profile-strokes">{{ t('profileWriting') }}</span><DoneCount :count="count" />
    </SectionHead>

    <div class="strokes__box print-trim print-trim--tiger">
      <p v-if="!progress.length" class="strokes__empty">{{ t('profileSentencesNone') }}</p>

      <ul v-else class="strokes__list">
        <li v-for="{ entry, written } in progress" :key="entry.list_id">
          <span class="hanzi strokes__word" :lang="prefs.isTraditional ? 'zh-Hant' : 'zh-Hans'">{{ characters(entry.word) }}</span>
          <TaskBox v-if="written" done />
          <AppButton v-else as="RouterLink" variant="primary" shape="sm" :to="{ name: 'write' }"
            :aria-label="t('profileWritingStartFor', { word: characters(entry.word) })">
            {{ t('profileWritingStart') }}
          </AppButton>
        </li>
      </ul>

      <h3 class="label strokes__past-title">{{ t('profileStrokesPast') }}</h3>
      <p v-if="!past.length" class="strokes__empty">{{ t('profileStrokesPastEmpty') }}</p>
      <table v-else class="past">
        <caption class="sr-only">{{ t('profileStrokesPast') }}</caption>
        <tbody>
          <tr v-for="row in past" :key="`${row.date}|${row.entry.list_id}|${row.entry.word.word_id ?? row.entry.word.simplified}`">
            <td class="mono past__date">{{ shortDate(row.date) }}</td>
            <td class="hanzi past__word" lang="zh">{{ characters(row.entry.word) }}</td>
            <td class="past__tick"><TaskBox done /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.strokes { display: flex; flex-direction: column; gap: var(--s-4); }
.strokes__box {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.strokes__empty { color: var(--c-body); }
.strokes__list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.strokes__list > li { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); min-height: 3rem; padding: var(--s-2) 0; }
.strokes__list > li + li { border-top: var(--bw-hair) solid var(--c-rule); }
.strokes__word { font-size: var(--t-lead); color: var(--c-ink); }
.strokes__past-title { margin: 0; padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.past { width: 100%; border-collapse: collapse; }
.past td { padding: var(--s-2) 0; text-align: left; vertical-align: middle; color: var(--c-ink); }
.past td + td { padding-left: var(--s-4); }
.past tbody tr + tr td { border-top: var(--bw-hair) solid var(--c-rule); }
.past__date { white-space: nowrap; font-size: var(--t-base); width: 1%; }
.past__tick { text-align: right; width: 1%; }
</style>
