<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import SoonNote from './SoonNote.vue'

// Ways to practise. The heroes version lists all three planned ways, two of
// them unbuilt. The launch version lists only what exists today: quizzes and
// the review screen. The quiz screen is not ported yet, so quizzes do not link.
defineProps({ heroes: { type: Boolean, default: false } })
const { t } = useI18n()
</script>

<template>
  <section class="stack">
    <SectionHead :title="heroes ? t('studyHeadline') : t('studyHeadlineLaunch')" />
    <ul class="study">
      <li class="study__item">
        <h3>{{ t('quizHeadline') }}</h3>
        <p>{{ t('quizBody') }}</p>
      </li>
      <template v-if="heroes">
        <li class="study__item">
          <h3>{{ t('sentenceHeadline') }}</h3>
          <SoonNote />
          <p>{{ t('sentenceBody') }}</p>
        </li>
        <li class="study__item">
          <h3>{{ t('writeHeadline') }}</h3>
          <SoonNote />
          <p>{{ t('writeBody') }}</p>
        </li>
      </template>
      <li v-else class="study__item">
        <h3><RouterLink class="study__link" to="/review">{{ t('studyReviewHeadline') }}</RouterLink></h3>
        <p>{{ t('studyReviewBody') }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stack { display: flex; flex-direction: column; gap: var(--s-6); }
.study { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-6); }
.study__item { display: flex; flex-direction: column; gap: var(--s-2); padding-top: var(--s-3); border-top: var(--bw-heavy) solid var(--c-ink); }
.study__item h3 { font-size: var(--t-lg); }
.study__link { color: var(--c-ink); text-decoration: underline; text-underline-offset: 0.2em; }

@media (min-width: 720px) {
  .study { grid-template-columns: repeat(var(--study-cols, 3), minmax(0, 1fr)); }
}
</style>
