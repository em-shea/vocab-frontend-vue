<script setup>
import { useListLabel } from '../../lib/listLabel'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import WordCard from '../WordCard.vue'
import SoonNote from './SoonNote.vue'
import { useVocabListsStore } from '../../stores/vocabLists'

// The HSK level picker with sample words. In the heroes version it is one of
// three ways in, alongside the catalogue and the upload (both unbuilt); in the
// launch version it is the whole section.
defineProps({ heroes: { type: Boolean, default: false } })

const { t } = useI18n()
const listLabel = useListLabel()
const lists = useVocabListsStore()
const openLevel = ref(null)

onMounted(async () => {
  await lists.load()
  openLevel.value = lists.all[0]?.list_id ?? null
})
</script>

<template>
  <section class="stack">
    <SectionHead :title="heroes ? t('chooseHeadline') : t('levelHeadline')" />

    <div class="way">
      <h3 v-if="heroes">{{ t('levelHeadline') }}</h3>
      <p>{{ t('levelBody') }}</p>

      <div class="levels">
        <label class="label" for="level-pick">{{ t('chooseLevel') }}</label>
        <select id="level-pick" v-model="openLevel" class="levels__select">
          <option v-for="list in lists.all" :key="list.list_id" :value="list.list_id">
            {{ listLabel(list.list_name) }}
          </option>
        </select>
      </div>

      <!-- Placeholder cards the size of the real ones while the words load, so the
           section doesn't change height when they arrive (Emily, 2026-11-24). -->
      <div v-if="lists.loading" class="samples" role="status" :aria-label="t('levelSamplesLoading')">
        <div v-for="n in 3" :key="n" class="sample-ghost" aria-hidden="true">
          <span class="sample-ghost__bar sample-ghost__bar--label" />
          <span class="sample-ghost__bar sample-ghost__bar--hanzi" />
          <span class="sample-ghost__bar sample-ghost__bar--pinyin" />
          <span class="sample-ghost__bar sample-ghost__bar--def" />
        </div>
      </div>
      <div v-else-if="lists.error" class="samples samples--empty">
        <p class="muted">{{ t('levelSamplesError') }}</p>
      </div>
      <!-- One row that scrolls sideways, so the samples don't take up the page. -->
      <div v-else class="samples" tabindex="0" role="region" :aria-label="t('levelSamples')">
        <WordCard
          v-for="entry in lists.samplesFor(openLevel)"
          :key="entry.word_id"
          :word="entry.word"
          compact
        />
      </div>
    </div>

    <div v-if="heroes" class="ways">
      <div class="way">
        <h3>{{ t('catalogueHeadline') }}</h3>
        <SoonNote />
        <p>{{ t('catalogueBody') }}</p>
      </div>
      <div class="way">
        <h3>{{ t('uploadHeadline') }}</h3>
        <SoonNote />
        <p>{{ t('uploadBody') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stack { display: flex; flex-direction: column; gap: var(--s-6); }
.muted { color: var(--c-muted); }

.way { display: flex; flex-direction: column; gap: var(--s-3); align-items: flex-start; min-width: 0; }
.way > .levels, .way > .samples { align-self: stretch; }
.way h3 { font-size: var(--t-lg); }
.ways { display: grid; gap: var(--s-8); }

.levels { display: flex; flex-direction: column; gap: var(--s-2); margin-top: var(--s-2); max-width: 20rem; }
.levels__select {
  width: 100%;
  padding: var(--s-3) var(--s-4);
  font: inherit;
  color: var(--c-ink);
  background-color: var(--c-panel);
  border: var(--bw-hair) solid var(--c-ink);
  border-radius: 0;
}

.samples {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(12rem, 14rem);
  gap: var(--s-4);
  margin-top: var(--s-2);
  padding-bottom: var(--s-3);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
}
.samples > * { scroll-snap-align: start; }
.samples:focus-visible { outline: 2px solid var(--c-red); outline-offset: 4px; }
.samples--empty { display: flex; align-items: center; min-height: calc(var(--sample-h) + var(--s-3)); }

/* Same size as a compact word card (measured 172px), with soft bars where its
   label, characters, pinyin and meaning go. */
.samples { --sample-h: 10.75rem; }
.sample-ghost {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  height: var(--sample-h);
  padding: var(--s-4);
  background-color: var(--c-panel);
  border: var(--bw-hair) solid var(--c-rule);
}
.sample-ghost__bar { display: block; height: 0.75rem; background-color: var(--c-sunk); animation: ghost 1.4s ease-in-out infinite; }
.sample-ghost__bar--label { width: 40%; }
.sample-ghost__bar--hanzi { width: 55%; height: 2.25rem; }
.sample-ghost__bar--pinyin { width: 35%; }
.sample-ghost__bar--def { width: 75%; }
@keyframes ghost { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .sample-ghost__bar { animation: none; } }

@media (min-width: 720px) {
  .ways { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
