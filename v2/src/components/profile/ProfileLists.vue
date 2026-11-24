<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'

// "Your lists" (Emily, 2026-11-23): under today's words, how far through each
// list the reader is: the share of its words they have been sent (seen), and
// the share they are proficient in. What counts as proficient is decided by
// the backend (GET /progress) and spelled out under "How is this measured?".
defineProps({
  rows: { type: Array, default: () => [] },   // lib/progress progressRows
  rule: { type: Object, required: true },      // lib/progress proficientRule
  status: { type: String, default: 'loading' }, // loading | ready | error
  listName: { type: Function, required: true }
})
defineEmits(['retry'])
const { t } = useI18n()
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
            <span>{{ t('profileListsProficient') }}</span>
            <span><strong>{{ row.proficientPct }}%</strong> · {{ t('profileListsOf', { n: row.proficient, total: row.total }) }}</span>
          </div>
          <div class="meter__track" role="progressbar" :aria-label="t('profileListsProficient')"
            aria-valuemin="0" aria-valuemax="100" :aria-valuenow="row.proficientPct">
            <div class="meter__fill meter__fill--proficient" :style="{ width: `${row.proficientPct}%` }" />
          </div>
        </div>
      </li>
    </ul>

    <details v-if="status === 'ready' && rows.length" class="lists__how">
      <summary>{{ t('profileListsHow') }}</summary>
      <p>{{ t('profileListsHowSeen') }}</p>
      <p>{{ t('profileListsHowProficient', { answers: rule.minQuizAnswers, pct: rule.accuracyPct }) }}</p>
    </details>
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
.meter { display: flex; flex-direction: column; gap: var(--s-1); }
.meter__label { display: flex; justify-content: space-between; gap: var(--s-4); font-size: var(--t-base); color: var(--c-body); }
.meter__label strong { color: var(--c-ink); }
.meter__track { height: 0.625rem; background-color: var(--c-ground); border: var(--bw-hair) solid var(--c-ink); }
.meter__fill { height: 100%; }
.meter__fill--seen { background-color: var(--c-gold); }
.meter__fill--proficient { background-color: var(--c-ink); }
.lists__how { font-size: var(--t-base); color: var(--c-body); }
.lists__how summary { cursor: pointer; color: var(--c-ink); text-decoration: underline; text-underline-offset: 0.2em; }
.lists__how p { margin-top: var(--s-2); }
</style>
