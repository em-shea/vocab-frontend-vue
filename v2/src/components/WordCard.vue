<script setup>
import { computed } from 'vue'
import AudioButton from './AudioButton.vue'
import { usePreferencesStore } from '../stores/preferences'

// The 每日一词 card. Renders whichever character form the reader has chosen, with
// pinyin, definition and pronunciation.
//
// Accepts a word in either shape the API returns: the review endpoint gives
// lowercase keys (simplified, audio_file_key), the raw word records give
// capitalised ones (Simplified, Audio file key).

const props = defineProps({
  word: { type: Object, required: true },
  date: { type: String, default: '' },
  level: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})

const prefs = usePreferencesStore()

const pick = (a, b) => props.word?.[a] ?? props.word?.[b] ?? ''

const simplified = computed(() => pick('simplified', 'Simplified'))
const traditional = computed(() => pick('traditional', 'Traditional'))
const pinyin = computed(() => pick('pinyin', 'Pinyin'))
const definition = computed(() => pick('definition', 'Definition'))
const audio = computed(() => pick('audio_file_key', 'Audio file key'))

// Traditional is not always recorded; fall back rather than render nothing.
const characters = computed(() =>
  prefs.isTraditional ? (traditional.value || simplified.value) : simplified.value
)
</script>

<template>
  <article class="word" :class="{ 'word--compact': compact }">
    <header v-if="level || date" class="word__meta">
      <span v-if="level" class="label">{{ level }}</span>
      <span v-if="date" class="mono word__date">{{ date }}</span>
    </header>

    <p class="hanzi word__characters">{{ characters }}</p>

    <div class="word__sound">
      <p class="pinyin word__pinyin">{{ pinyin }}</p>
      <AudioButton :src="audio" :label="characters" />
    </div>

    <p v-if="definition" class="word__definition" :title="definition">{{ definition }}</p>
  </article>
</template>

<style scoped>
.word {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-6);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-rule-light);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-hairline);
}

.word__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  padding-bottom: var(--s-2);
  border-bottom: var(--bw-hair) solid var(--c-rule);
}

.word__date { font-size: var(--t-sm); color: var(--c-muted); }

.word__characters {
  font-size: var(--t-3xl);
  line-height: var(--lh-tight);
  color: var(--c-ink);
  font-weight: var(--w-bold);
}

.word--compact .word__characters { font-size: var(--t-xl); }

.word__sound {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.word__pinyin { font-size: var(--t-lead); }

.word__definition {
  color: var(--c-body);
  font-size: var(--t-base);
  padding-top: var(--s-2);
  border-top: var(--bw-hair) solid var(--c-rule);
}

/* Some HSK definitions run to a dozen senses. In the sample grid that stretches
   one card far past its neighbours, so compact cards clamp and show the rest on
   hover via the title attribute. */
.word--compact .word__definition {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
