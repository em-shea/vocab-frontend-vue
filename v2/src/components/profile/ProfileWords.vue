<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import WordCard from '../WordCard.vue'
import TaskBox from '../TaskBox.vue'
import AppButton from '../AppButton.vue'
import { SENTENCES_ENABLED } from '../../featureFlags'

// The newest word from each list the learner takes, with the way to quiz on
// or review that list. The links keep the old screen's settings: a 14-day,
// ten-question quiz and the past 30 days of words.

defineProps({
  progress: { type: Array, required: true }, // lib/profile wordProgress: { entry, quiz, sentence }
  hasLists: { type: Boolean, required: true },
  listName: { type: Function, required: true }
})
const { t } = useI18n()
const quizRoute = (entry) => ({ name: 'quiz', query: { list_id: entry.list_id, date_range: '14', ques: '10' } })
</script>

<template>
  <section class="words" aria-labelledby="profile-words">
    <SectionHead>
      <span id="profile-words">{{ t('profileWordsTitle', Math.max(progress.length, 1)) }}</span>
    </SectionHead>

    <p v-if="!hasLists" class="words__empty">
      {{ t('profileNoLists') }}
      <RouterLink to="/manage-lists">{{ t('profileManageLists') }}</RouterLink>
    </p>

    <ul v-else class="words__grid">
      <li v-for="{ entry, quiz, sentence } in progress" :key="entry.list_id">
        <WordCard :word="entry.word" :level="listName(entry.list_id)">
          <!-- Each task is a button until it is done, then a ticked line that
               still links back to it. -->
          <div class="words__links">
            <template v-if="quiz">
              <RouterLink :to="quizRoute(entry)">{{ t('profileQuiz') }}</RouterLink>
              <TaskBox done />
            </template>
            <AppButton v-else as="RouterLink" variant="seal" shape="sm" :to="quizRoute(entry)">
              {{ t('profileQuizTakeShort') }}
            </AppButton>
          </div>
          <div v-if="SENTENCES_ENABLED" class="words__links">
            <template v-if="sentence">
              <RouterLink :to="{ name: 'sentences' }">{{ t('navSentences') }}</RouterLink>
              <TaskBox done />
            </template>
            <AppButton v-else as="RouterLink" variant="seal" shape="sm" :to="{ name: 'sentences' }">
              {{ t('profileSentencesWrite') }}
            </AppButton>
          </div>
        </WordCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.words { display: flex; flex-direction: column; gap: var(--s-4); }

.words__empty { color: var(--c-body); }

.words__grid {
  display: grid;
  /* One word fills the column; two or more share it. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.words__grid > li { display: flex; }
.words__grid > li > * { flex: 1; }

.words__links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s-4);
  padding-top: var(--s-3);
  border-top: var(--bw-hair) solid var(--c-rule);
  font-size: var(--t-base);
}
/* The first row sits at the foot of the card; the second follows it. */
.words__links:first-of-type { margin-top: auto; }

</style>
