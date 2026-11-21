<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import AppButton from '../AppButton.vue'
import { scorePercent } from '../../lib/profile'
import DoneCount from './DoneCount.vue'

// Today's quiz, and every quiz saved in the past week (GET /quizzes). This
// replaces the old /my-quizzes page, which was never finished.

const props = defineProps({
  count: { type: Object, required: true },      // { done, total } over today's words
  history: { type: Array, default: () => [] },  // lib/profile quizHistory
  status: { type: String, default: 'loading' }, // loading | ready | error
  quizLink: { type: Object, required: true },
  listName: { type: Function, required: true }
})
const emit = defineEmits(['retry'])
const { t, locale } = useI18n()

const dateFormat = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
)
function shortDate (iso) {
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.value.format(date)
}

const score = (quiz) => t('profileHistoryScoreValue', {
  correct: quiz.correct_answers,
  total: quiz.question_quantity,
  percent: scorePercent(quiz)
})

// A quiz can be saved for a list no longer in the store's names.
const nameOf = (quiz) => props.listName(quiz.list_id)
</script>

<template>
  <section class="quizzes" aria-labelledby="profile-quizzes">
    <SectionHead>
      <span id="profile-quizzes">{{ t('profileQuizzesTitle') }}</span><DoneCount :count="count" />
    </SectionHead>

    <div class="quizzes__box">
      <p v-if="count.total && count.done === count.total" class="quizzes__today">
        {{ t('profileQuizzesAllDone') }}
      </p>
      <div v-else>
        <AppButton as="RouterLink" :to="quizLink" variant="seal">{{ t('profileQuizTake') }}</AppButton>
      </div>

      <h3 class="label quizzes__week">{{ t('profilePastWeek') }}</h3>

      <p v-if="status === 'loading'" class="quizzes__state" role="status">{{ t('profileLoading') }}</p>

      <div v-else-if="status === 'error'" class="quizzes__state" role="alert">
        <p>{{ t('profileHistoryError') }}</p>
        <AppButton variant="quiet" shape="sm" @click="emit('retry')">{{ t('profileRetry') }}</AppButton>
      </div>

      <p v-else-if="!history.length" class="quizzes__state">{{ t('profileHistoryEmpty') }}</p>

      <table v-else class="history">
        <caption class="sr-only">{{ t('profileHistoryCaption') }}</caption>
        <thead class="sr-only">
          <tr>
            <th scope="col">{{ t('profileHistoryDate') }}</th>
            <th scope="col">{{ t('profileHistoryList') }}</th>
            <th scope="col">{{ t('profileHistoryScore') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in history" :key="quiz.quiz_id || `${quiz.date_created}-${quiz.list_id}`">
            <td class="mono history__date">{{ shortDate(quiz.date_created) }}</td>
            <td>{{ nameOf(quiz) }}</td>
            <td class="history__score">{{ score(quiz) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.quizzes { display: flex; flex-direction: column; gap: var(--s-4); }

.quizzes__today { color: var(--c-ink); font-size: var(--t-lead); }

.quizzes__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-3);
  color: var(--c-body);
}

.quizzes__box {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.quizzes__week { margin: 0; padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }

.history { width: 100%; border-collapse: collapse; }
.history td { padding: var(--s-2) 0; text-align: left; vertical-align: baseline; color: var(--c-ink); }
.history td + td { padding-left: var(--s-4); }
.history tbody tr + tr td { border-top: var(--bw-hair) solid var(--c-rule); }
.history__date { white-space: nowrap; font-size: var(--t-base); }
.history .history__score { text-align: right; }


.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
