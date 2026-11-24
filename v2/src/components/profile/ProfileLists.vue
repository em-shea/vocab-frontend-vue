<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'

// "Your lists" (Emily, 2026-11-23): at the foot of the profile, how far
// through each list the reader is: the share of its words they have been sent
// (seen), and the share they are proficient in. What counts as proficient is
// decided by the backend (GET /progress) and explained in a tooltip on the
// Proficient label.
defineProps({
  rows: { type: Array, default: () => [] },   // lib/progress progressRows
  rule: { type: Object, required: true },      // lib/progress proficientRule
  status: { type: String, default: 'loading' }, // loading | ready | error
  listName: { type: Function, required: true }
})
defineEmits(['retry'])
const { t, locale } = useI18n()
const open = ref('')
const cutoff = (rule) => {
  if (!rule.quizzesOnlyBefore) return ''
  const [y, m, d] = rule.quizzesOnlyBefore.split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)))
}
</script>

<template>
  <section class="lists" aria-labelledby="profile-lists">
    <SectionHead><span id="profile-lists">{{ t('profileListsTitle') }}</span></SectionHead>

    <p v-if="status === 'loading'" class="lists__state" role="status">{{ t('profileListsLoading') }}</p>
    <p v-else-if="status === 'error'" class="lists__state" role="alert">
      {{ t('profileListsError') }}
      <button type="button" class="lists__retry" @click="$emit('retry')">{{ t('sentencesRetry') }}</button>
    </p>
    <p v-else-if="!rows.length" class="lists__state">{{ t('profileListsNone') }}</p>

    <ul v-else class="lists__list">
      <li v-for="row in rows" :key="row.list_id" class="list">
        <h3 class="list__name">{{ listName(row.list_id) }}</h3>
        <div class="meter">
          <div class="meter__label">
            <span>{{ t('profileListsSeen') }}</span>
            <span><strong>{{ row.seenPct }}%</strong> · {{ t('profileListsOf', { n: row.seen, total: row.total }) }}</span>
          </div>
          <div class="meter__track" role="progressbar" :aria-label="t('profileListsSeen')"
            aria-valuemin="0" aria-valuemax="100" :aria-valuenow="row.seenPct">
            <div class="meter__fill meter__fill--seen" :style="{ width: `${row.seenPct}%` }" />
          </div>
        </div>
        <div class="meter">
          <div class="meter__label">
            <span class="meter__name">
              {{ t('profileListsProficient') }}
              <!-- How it's worked out, on hover, focus or tap. -->
              <span class="tip">
                <button type="button" class="tip__button" :aria-describedby="`tip-${row.list_id}`"
                  :aria-expanded="open === row.list_id" :aria-label="t('profileListsHow')"
                  @click="open = open === row.list_id ? '' : row.list_id" @blur="open = ''">?</button>
                <span :id="`tip-${row.list_id}`" role="tooltip" class="tip__text" :class="{ 'tip__text--open': open === row.list_id }">
                  {{ t('profileListsHowProficient', { answers: rule.minQuizAnswers, pct: rule.accuracyPct }) }}
                  <template v-if="rule.quizzesOnlyBefore">{{ t('profileListsHowOlder', { date: cutoff(rule) }) }}</template>
                </span>
              </span>
            </span>
            <span><strong>{{ row.proficientPct }}%</strong> · {{ t('profileListsOf', { n: row.proficient, total: row.total }) }}</span>
          </div>
          <div class="meter__track" role="progressbar" :aria-label="t('profileListsProficient')"
            aria-valuemin="0" aria-valuemax="100" :aria-valuenow="row.proficientPct">
            <div class="meter__fill meter__fill--proficient" :style="{ width: `${row.proficientPct}%` }" />
          </div>
        </div>
      </li>
    </ul>

  </section>
</template>

<style scoped>
.lists { display: flex; flex-direction: column; gap: var(--s-4); }
.lists__state { color: var(--c-body); }
.lists__retry { padding: 0; font: inherit; color: var(--c-red); background: none; border: 0; text-decoration: underline; cursor: pointer; }
.lists__list { display: flex; flex-direction: column; gap: var(--s-4); margin: 0; padding: 0; list-style: none; }
.list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-hair) solid var(--c-rule);
}
.list__name { font-size: var(--t-lead); color: var(--c-ink); }
.meter { position: relative; display: flex; flex-direction: column; gap: var(--s-1); }
.meter__label { display: flex; justify-content: space-between; gap: var(--s-4); font-size: var(--t-base); color: var(--c-body); }
.meter__label strong { color: var(--c-ink); }
.meter__track { height: 0.625rem; background-color: var(--c-ground); border: var(--bw-hair) solid var(--c-ink); }
.meter__fill { height: 100%; }
.meter__fill--seen { background-color: var(--c-gold); }
.meter__fill--proficient { background-color: var(--c-ink); }
.meter__name { display: inline-flex; align-items: center; gap: var(--s-2); }
.tip { display: inline-flex; }
.tip__button {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--c-ink);
  background: none;
  border: var(--bw-hair) solid var(--c-ink);
  border-radius: 50%;
  cursor: help;
}
.tip__text {
  position: absolute;
  z-index: 5;
  /* Spans the bar it explains, so it never sticks out past the screen. */
  left: 0;
  right: 0;
  bottom: calc(100% + var(--s-2));
  padding: var(--s-3) var(--s-4);
  font-size: var(--t-sm);
  line-height: var(--lh-snug);
  color: var(--c-ground);
  background-color: var(--c-ink);
  box-shadow: var(--shadow-hard);
  visibility: hidden;
  opacity: 0;
  transition: opacity 120ms;
}
.tip:hover .tip__text, .tip__button:focus-visible + .tip__text, .tip__text--open { visibility: visible; opacity: 1; }
/* One list per row at full column width (Emily, 2026-11-24). */
</style>
