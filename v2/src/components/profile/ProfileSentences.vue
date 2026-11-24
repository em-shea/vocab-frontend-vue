<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import DoneCount from './DoneCount.vue'
import PencilIcon from '../PencilIcon.vue'
import AppButton from '../AppButton.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { recentDays } from '../../lib/sentences'

// Today's sentences at a glance: each of today's words with the sentence
// written for it, or a way to write one. Writing happens on /sentences.
// Shown only while SENTENCES_ENABLED is on (see ProfileView).
//
// Uses the same words as the word cards (wordProgress), so the count, the
// rows and the cards always agree.

const props = defineProps({
  // The same words as the word cards: lib/profile wordProgress.
  progress: { type: Array, default: () => [] },
  count: { type: Object, default: () => ({ done: 0, total: 0 }) }, // { done, total } over today's words
  activity: { type: Object, default: () => ({}) } // for past sentences
})
const { t, locale } = useI18n()
const prefs = usePreferencesStore()

const rows = computed(() => props.progress)

// Past sentences, laid out like the quizzes box's past week: every sentence
// written for an earlier day's word in the activity (its last 10 days).
const todayDate = computed(() => props.progress[0]?.entry.date_sent)
const past = computed(() => recentDays(props.activity)
  .filter((day) => day.date !== todayDate.value)
  .flatMap((day) => day.words.filter((e) => e.sentence?.sentence).map((e) => ({ date: day.date, entry: e }))))
const shortDate = (date) => {
  const [y, m, d] = String(date).split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)))
}
const characters = (word) => (prefs.isTraditional ? word.traditional : word.simplified) || word.simplified
</script>

<template>
  <section class="sentences" aria-labelledby="profile-sentences">
    <SectionHead>
      <span id="profile-sentences">{{ t('profileSentencesTitle') }}</span><DoneCount :count="count" />
    </SectionHead>

    <div class="sentences__box">
      <p v-if="!rows.length" class="sentences__empty">{{ t('profileSentencesNone') }}</p>

      <ul v-else class="sentences__list">
        <li v-for="{ entry, sentence } in rows" :key="entry.list_id">
          <span class="hanzi sentences__word" :lang="prefs.isTraditional ? 'zh-Hant' : 'zh-Hans'">{{ characters(entry.word) }}</span>
          <!-- The visitor's own sentence sits in a filled-in field, so it reads
               as something they wrote, not page text. -->
          <span v-if="sentence" class="hanzi sentences__text" lang="zh">{{ sentence.sentence }}</span>
          <RouterLink v-if="sentence" class="sentences__edit" :to="{ name: 'sentences' }"
            :aria-label="t('profileSentenceEdit', { word: characters(entry.word) })">
            <PencilIcon />
          </RouterLink>
          <AppButton v-else as="RouterLink" variant="primary" shape="sm" class="sentences__write"
            :to="{ name: 'sentences' }"
            :aria-label="t('profileSentenceWriteFor', { word: characters(entry.word) })">
            {{ t('profileSentencesWrite') }}
          </AppButton>
        </li>
      </ul>

      <h3 class="label sentences__past-title">{{ t('profileSentencesPast') }}</h3>
      <p v-if="!past.length" class="sentences__empty">{{ t('profileSentencesPastEmpty') }}</p>
      <table v-else class="past">
        <caption class="sr-only">{{ t('profileSentencesPast') }}</caption>
        <tbody>
          <tr v-for="row in past" :key="`${row.date}|${row.entry.list_id}|${row.entry.word.word_id ?? row.entry.word.simplified}`">
            <td class="mono past__date">{{ shortDate(row.date) }}</td>
            <td class="hanzi past__word" lang="zh">{{ characters(row.entry.word) }}</td>
            <td class="hanzi past__text" lang="zh">{{ row.entry.sentence.sentence }}</td>
          </tr>
        </tbody>
      </table>

      <RouterLink class="sentences__all" :to="{ name: 'sentences' }">{{ t('profileSentencesAll') }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.sentences { display: flex; flex-direction: column; gap: var(--s-4); }

.sentences__box {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

.sentences__empty { color: var(--c-body); }

.sentences__list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.sentences__list > li {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-3) 0;
}
.sentences__list > li + li { border-top: var(--bw-hair) solid var(--c-rule); }
.sentences__word { flex: none; min-width: 3em; font-size: var(--t-lead); color: var(--c-ink); }
.sentences__text {
  flex: 1;
  min-width: 0;
  padding: var(--s-2) var(--s-3);
  background-color: var(--c-ground);
  border: var(--bw-hair) solid var(--c-rule);
  border-left: 3px solid var(--c-ink);
  color: var(--c-ink);
  overflow-wrap: anywhere;
}
.sentences__write { margin-left: auto; }
.sentences__edit {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--c-ink);
}
.sentences__edit:hover, .sentences__edit:focus-visible { color: var(--c-red); }

.sentences__all {
  align-self: flex-start;
  padding-top: var(--s-4);
  font-size: var(--t-base);
}
.sentences__past-title { margin: 0; padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.past { width: 100%; border-collapse: collapse; }
.past td { padding: var(--s-2) 0; text-align: left; vertical-align: baseline; color: var(--c-ink); }
.past td + td { padding-left: var(--s-4); }
.past tbody tr + tr td { border-top: var(--bw-hair) solid var(--c-rule); }
.past__date { white-space: nowrap; font-size: var(--t-base); }
.past__word { white-space: nowrap; }
.past__text { overflow-wrap: anywhere; }
</style>
