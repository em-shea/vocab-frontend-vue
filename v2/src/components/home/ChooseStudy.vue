<script setup>
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

      <div class="levels" role="tablist">
        <button
          v-for="list in lists.all"
          :key="list.list_id"
          type="button"
          role="tab"
          class="levels__tab"
          :class="{ 'levels__tab--on': openLevel === list.list_id }"
          :aria-selected="openLevel === list.list_id"
          @click="openLevel = list.list_id"
        >
          {{ list.list_name }}
        </button>
      </div>

      <div v-if="lists.loading" class="samples samples--empty">
        <p class="muted">Loading sample words…</p>
      </div>
      <div v-else-if="lists.error" class="samples samples--empty">
        <p class="muted">Sample words are unavailable right now.</p>
      </div>
      <div v-else class="samples">
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

.levels { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-top: var(--s-2); }
.levels__tab {
  padding: var(--s-2) var(--s-4);
  background-color: var(--c-panel);
  border: var(--bw-hair) solid var(--c-rule);
  border-radius: var(--r-pill);
  font-family: var(--f-label);
  font-size: var(--t-base);
  color: var(--c-body);
  cursor: pointer;
}
.levels__tab--on { background-color: var(--c-ink); border-color: var(--c-ink); color: var(--c-on-dark); }

.samples { display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); margin-top: var(--s-2); }
.samples--empty { display: block; }

@media (min-width: 720px) {
  .ways { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
