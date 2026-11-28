<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { signInRoute } from '../../lib/signInReturn'
import AppButton from '../AppButton.vue'
import { percent } from '../../lib/quiz'

// The score, and what happened to it. Signed-in results are saved to the
// account (POST /quizzes); signed-out visitors are offered sign-in instead.

defineProps({
  correct: { type: Number, required: true },
  total: { type: Number, required: true },
  save: { type: String, default: 'signed-out' }, // signed-out | saving | saved | failed
  reviewLink: { type: Object, required: true }
})
const emit = defineEmits(['again', 'retry-save'])
const { t } = useI18n()
const route = useRoute()
</script>

<template>
  <section class="results">
    <h2 class="results__title" tabindex="-1">{{ t('quizScoreTitle') }}</h2>
    <p class="results__score">{{ t('quizScore', { correct, total, percent: percent(correct, total) }) }}</p>

    <p class="results__save" role="status">
      <template v-if="save === 'saving'">{{ t('quizSaving') }}</template>
      <template v-else-if="save === 'saved'">{{ t('quizSaved') }}</template>
      <template v-else-if="save === 'failed'">{{ t('quizSaveFailed') }}</template>
      <RouterLink v-else :to="signInRoute(route.fullPath)">{{ t('quizSignIn') }}</RouterLink>
    </p>

    <!-- Another quiz and the profile side by side, review below (Emily, 2026-11-28). -->
    <div class="results__actions">
      <AppButton variant="primary" @click="emit('again')">{{ t('quizAgain') }}</AppButton>
      <AppButton as="RouterLink" variant="quiet" :to="{ name: 'profile' }">{{ t('quizProfile') }}</AppButton>
      <AppButton v-if="save === 'failed'" variant="quiet" @click="emit('retry-save')">{{ t('quizSaveRetry') }}</AppButton>
    </div>
    <RouterLink class="results__review" :to="reviewLink">{{ t('quizReviewWords') }}</RouterLink>
  </section>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-8) var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.results__title { font-size: var(--t-xl); outline: none; }
.results__score { font-size: var(--t-lead); color: var(--c-ink); }
.results__save { color: var(--c-body); }
.results__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: var(--s-3);
  max-width: 24rem;
}
.results__actions > * { justify-content: center; padding-inline: var(--s-3); }
.results__review { align-self: flex-start; }
.results__review { font-size: var(--t-base); }
</style>
