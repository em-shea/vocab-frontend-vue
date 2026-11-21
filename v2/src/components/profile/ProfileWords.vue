<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import WordCard from '../WordCard.vue'

// The newest word from each list the learner takes, with the way to quiz on
// or review that list. The links keep the old screen's settings: a 14-day,
// ten-question quiz and the past 30 days of words.

defineProps({
  words: { type: Array, required: true }, // review-word entries from lib/profile latestWords
  hasLists: { type: Boolean, required: true },
  listName: { type: Function, required: true }
})
const { t } = useI18n()
</script>

<template>
  <section class="words" aria-labelledby="profile-words">
    <SectionHead>
      <span id="profile-words">{{ t('profileWordsTitle', Math.max(words.length, 1)) }}</span>
    </SectionHead>

    <p v-if="!hasLists" class="words__empty">
      {{ t('profileNoLists') }}
      <RouterLink to="/manage-lists">{{ t('profileManageLists') }}</RouterLink>
    </p>

    <ul v-else class="words__grid">
      <li v-for="entry in words" :key="entry.list_id">
        <WordCard :word="entry.word" :level="listName(entry.list_id)">
          <div class="words__links">
            <RouterLink :to="{ name: 'quiz', query: { list_id: entry.list_id, date_range: '14', ques: '10' } }">
              {{ t('profileQuiz') }}
            </RouterLink>
            <RouterLink :to="{ name: 'review', query: { list_id: entry.list_id, date_range: '30' } }">
              {{ t('profileReview') }}
            </RouterLink>
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
  gap: var(--s-4);
  margin-top: auto;
  padding-top: var(--s-3);
  border-top: var(--bw-hair) solid var(--c-rule);
  font-size: var(--t-base);
}
</style>
