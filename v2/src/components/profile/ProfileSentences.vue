<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import DoneCount from './DoneCount.vue'
import PencilIcon from '../PencilIcon.vue'
import AppButton from '../AppButton.vue'
import { usePreferencesStore } from '../../stores/preferences'

// Today's sentences at a glance: each of today's words with the sentence
// written for it, or a way to write one. Writing happens on /sentences.
// Shown only while SENTENCES_ENABLED is on (see ProfileView).
//
// Uses the same words as the word cards (wordProgress), so the count, the
// rows and the cards always agree.

const props = defineProps({
  // The same words as the word cards: lib/profile wordProgress.
  progress: { type: Array, default: () => [] },
  count: { type: Object, default: () => ({ done: 0, total: 0 }) } // { done, total } over today's words
})
const { t } = useI18n()
const prefs = usePreferencesStore()

const rows = computed(() => props.progress)
const characters = (word) => (prefs.isTraditional ? word.traditional : word.simplified) || word.simplified
</script>

<template>
  <section class="sentences" aria-labelledby="profile-sentences">
    <SectionHead>
      <span id="profile-sentences">{{ t('profileSentencesTitle') }}</span><DoneCount :count="count" />
    </SectionHead>

    <div class="sentences__box">
      <p v-if="!rows.length" class="sentences__empty">{{ t('profileSentencesNone') }}</p>

      <ul v-else class="sentences__list">
        <li v-for="{ entry, sentence } in rows" :key="entry.list_id">
          <span class="hanzi sentences__word" :lang="prefs.isTraditional ? 'zh-Hant' : 'zh-Hans'">{{ characters(entry.word) }}</span>
          <!-- The visitor's own sentence sits in a filled-in field, so it reads
               as something they wrote, not page text. -->
          <span v-if="sentence" class="hanzi sentences__text" lang="zh">{{ sentence.sentence }}</span>
          <RouterLink v-if="sentence" class="sentences__edit" :to="{ name: 'sentences' }"
            :aria-label="t('profileSentenceEdit', { word: characters(entry.word) })">
            <PencilIcon />
          </RouterLink>
          <AppButton v-else as="RouterLink" variant="seal" shape="sm" class="sentences__write"
            :to="{ name: 'sentences' }"
            :aria-label="t('profileSentenceWriteFor', { word: characters(entry.word) })">
            {{ t('profileSentencesWrite') }}
          </AppButton>
        </li>
      </ul>

      <RouterLink class="sentences__all" :to="{ name: 'sentences' }">{{ t('profileSentencesAll') }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.sentences { display: flex; flex-direction: column; gap: var(--s-4); }

.sentences__box {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

.sentences__empty { color: var(--c-body); }

.sentences__list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.sentences__list > li {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-3) 0;
}
.sentences__list > li + li { border-top: var(--bw-hair) solid var(--c-rule); }
.sentences__word { flex: none; min-width: 3em; font-size: var(--t-lead); color: var(--c-ink); }
.sentences__text {
  flex: 1;
  min-width: 0;
  padding: var(--s-2) var(--s-3);
  background-color: var(--c-ground);
  border: var(--bw-hair) solid var(--c-rule);
  border-left: 3px solid var(--c-ink);
  color: var(--c-ink);
  overflow-wrap: anywhere;
}
.sentences__write { margin-left: auto; }
.sentences__edit {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--c-ink);
}
.sentences__edit:hover, .sentences__edit:focus-visible { color: var(--c-red); }

.sentences__all {
  align-self: flex-start;
  padding-top: var(--s-4);
  font-size: var(--t-base);
}
</style>
