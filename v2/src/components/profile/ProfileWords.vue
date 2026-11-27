<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import WordCard from '../WordCard.vue'
import TaskBox from '../TaskBox.vue'
import AppButton from '../AppButton.vue'
import { SENTENCES_ENABLED, WRITING_ENABLED } from '../../featureFlags'

// The newest word from each list the learner takes, with the way to quiz on
// or review that list. The links keep the old screen's settings: a 14-day,
// ten-question quiz and the past 30 days of words.

defineProps({
  progress: { type: Array, required: true }, // lib/profile wordProgress: { entry, quiz, sentence }
  hasLists: { type: Boolean, required: true },
  listName: { type: Function, required: true },
  // The character set a list is taken in ('' if both): its card follows it.
  setFor: { type: Function, default: () => '' }
})
const { t } = useI18n()
const quizRoute = (entry) => ({ name: 'quiz', query: { list_id: entry.list_id, date_range: '14', ques: '10' } })
</script>

<template>
  <!-- id="today": the daily notification opens /profile#today, here. -->
  <section id="today" class="words" aria-labelledby="profile-words">
    <SectionHead>
      <span id="profile-words">{{ t('profileWordsTitle', Math.max(progress.length, 1)) }}</span>
    </SectionHead>

    <p v-if="!hasLists" class="words__empty">
      {{ t('profileNoLists') }}
      <RouterLink to="/manage-lists">{{ t('profileManageLists') }}</RouterLink>
    </p>

    <ul v-else class="words__grid">
      <li v-for="{ entry, quiz, sentence, written } in progress" :key="entry.list_id">
        <WordCard :word="entry.word" :level="listName(entry.list_id)" :character-set="setFor(entry.list_id)">
          <!-- Each task: its name on the left in plain text; on the right a
               button until it is done, then a ticked box (Emily, 2026-11-22). -->
          <div class="words__links words__links--first">
            <span>{{ t('profileQuiz') }}</span>
            <TaskBox v-if="quiz" done />
            <AppButton v-else as="RouterLink" variant="primary" shape="sm" :to="quizRoute(entry)"
              :aria-label="t('profileQuizTakeFor', { list: listName(entry.list_id) })">
              {{ t('profileQuizTakeShort') }}
            </AppButton>
          </div>
          <div v-if="SENTENCES_ENABLED" class="words__links">
            <span>{{ t('profileSentence') }}</span>
            <TaskBox v-if="sentence" done />
            <AppButton v-else as="RouterLink" variant="primary" shape="sm" :to="{ name: 'sentences' }"
              :aria-label="t('profileSentenceWriteFor', { word: entry.word.simplified })">
              {{ t('profileSentenceWriteShort') }}
            </AppButton>
          </div>
          <div v-if="WRITING_ENABLED" class="words__links">
            <span>{{ t('profileWriting') }}</span>
            <TaskBox v-if="written" done />
            <AppButton v-else as="RouterLink" variant="primary" shape="sm" :to="{ name: 'write' }"
              :aria-label="t('profileWritingStartFor', { word: entry.word.simplified })">
              {{ t('profileWritingStart') }}
            </AppButton>
          </div>
        </WordCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.words {
  display: flex; flex-direction: column; gap: var(--s-4);
  /* Clear of the sticky site nav when scrolled to. */
  scroll-margin-top: var(--s-24);
}

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
/* A heavier ink line between the word and its tasks, so they read as two
   parts; the line between the two tasks stays a hairline. */
.words__links--first { margin-top: auto; border-top: var(--bw-heavy) solid var(--c-ink); }

</style>
