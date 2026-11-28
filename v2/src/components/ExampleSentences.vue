<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '../stores/preferences'
import { examplesFor } from '../lib/examples'

// "Example sentences" under a word: tap to show our three sentences in place
// (Emily, 2026-11-28; they replace the YellowBridge / Baidu links). Hidden for
// words we have no sentences for, such as a user's own list.
const props = defineProps({
  word: { type: Object, required: true },
  // The list's set ('simplified' | 'traditional'); the globe menu when ''.
  characterSet: { type: String, default: '' }
})
const { t } = useI18n()
const prefs = usePreferencesStore()
const traditional = computed(() => props.characterSet ? props.characterSet === 'traditional' : prefs.isTraditional)

const open = ref(false)
const rows = ref([])
const id = `ex-${Math.random().toString(36).slice(2, 9)}`

watch([() => props.word, traditional], async ([word, trad]) => {
  rows.value = await examplesFor(word, trad)
}, { immediate: true })
</script>

<template>
  <div v-if="rows.length" class="examples">
    <button
      type="button"
      class="examples__toggle"
      :aria-expanded="open"
      :aria-controls="id"
      @click="open = !open"
    >
      {{ t('sentencesExamples') }}
      <svg class="examples__chev" :class="{ 'is-open': open }" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
    </button>
    <ol v-if="open" :id="id" class="examples__list">
      <li v-for="row in rows" :key="row.zh" class="examples__item">
        <p class="hanzi examples__zh" :lang="traditional ? 'zh-Hant' : 'zh-Hans'">{{ row.zh }}</p>
        <p class="pinyin examples__py">{{ row.pinyin }}</p>
        <p class="examples__en" lang="en">{{ row.en }}</p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.examples { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-3); }
.examples__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-seal);
  font: inherit;
  font-size: var(--t-base);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.examples__chev { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.6; transition: transform 150ms; }
.examples__chev.is-open { transform: rotate(180deg); }
.examples__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  width: 100%;
  margin: 0;
  padding: 0 0 0 var(--s-3);
  list-style: none;
  border-left: var(--bw-heavy, 3px) solid var(--c-seal);
}
.examples__item p { margin: 0; }
.examples__zh { font-size: var(--t-lg); line-height: var(--lh-snug); color: var(--c-ink); }
.examples__py { font-size: var(--t-sm); color: var(--c-muted); }
.examples__en { font-size: var(--t-base-sm); color: var(--c-ink); }
@media (prefers-reduced-motion: reduce) { .examples__chev { transition: none; } }
</style>
