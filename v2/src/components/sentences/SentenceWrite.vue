<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../AppButton.vue'
import AudioButton from '../AudioButton.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { MAX_LENGTH } from '../../lib/sentences'
import ExampleSentences from '../ExampleSentences.vue'
import { useDefinition } from '../../lib/cnDefinitions'

// One of today's words, with a field for a sentence that uses it. The screen
// does the saving; this holds the draft and says how the save went.

const props = defineProps({
  entry: { type: Object, required: true },
  // The sentence already saved for this word today, if any.
  saved: { type: String, default: '' },
  status: { type: String, default: 'idle' }, // idle | saving | saved | failed | empty
  // The word's list's character set (lib/listSets.js); the globe menu when not given.
  characterSet: { type: String, default: '' }
})
const emit = defineEmits(['save', 'edit'])
const { t } = useI18n()
const prefs = usePreferencesStore()

const draft = ref(props.saved)
const field = ref(null)
const id = computed(() => `sentence-${props.entry.list_id}-${props.entry.word.word_id ?? props.entry.word.simplified}`)
const word = computed(() => props.entry.word)
const definitionOf = useDefinition()
// Traditional is not always recorded; fall back rather than render nothing.
const isTraditional = computed(() => props.characterSet ? props.characterSet === 'traditional' : prefs.isTraditional)
const characters = computed(() =>
  (isTraditional.value ? word.value.traditional : word.value.simplified) || word.value.simplified
)

// Ideas for a sentence, from the same sites the daily email links to.

function submit () {
  emit('save', draft.value)
}

function input () {
  if (props.status !== 'idle' && props.status !== 'saving') emit('edit')
}

// An empty save sends the writer back to the field.
watch(() => props.status, (now) => { if (now === 'empty') field.value?.focus() })
</script>

<template>
  <article class="write">
    <div class="write__word">
      <p class="hanzi write__characters" :lang="isTraditional ? 'zh-Hant' : 'zh-Hans'">{{ characters }}</p>
      <p class="pinyin write__pinyin">{{ word.pinyin }}</p>
      <AudioButton :src="word.audio_file_key" :label="characters" />
    </div>
    <p v-if="word.definition" class="write__definition">{{ definitionOf(word) }}</p>
    <ExampleSentences :word="word" :character-set="isTraditional ? 'traditional' : 'simplified'" />

    <form class="write__form" novalidate @submit.prevent="submit">
      <!-- Not shown (Emily, 2026-11-20): the word sits right above the field. -->
      <label class="sr-only" :for="id">{{ t('sentencesField', { word: characters }) }}</label>
      <div class="write__row">
        <input
          :id="id"
          ref="field"
          v-model="draft"
          class="hanzi write__input"
          type="text"
          lang="zh"
          autocomplete="off"
          :maxlength="MAX_LENGTH"
          :disabled="status === 'saving'"
          :aria-invalid="status === 'empty'"
          :aria-describedby="`${id}-msg`"
          @input="input"
        />
        <AppButton type="submit" variant="primary" shape="sm" :disabled="status === 'saving'">
          {{ status === 'saving' ? t('sentencesSaving') : t('sentencesSave') }}
        </AppButton>
      </div>
      <p :id="`${id}-msg`" class="write__msg" :class="{ 'write__msg--bad': status === 'failed' || status === 'empty' }" role="status">
        <template v-if="status === 'saved'">{{ t('sentencesSaved') }}</template>
        <template v-else-if="status === 'failed'">{{ t('sentencesSaveFailed') }}</template>
        <template v-else-if="status === 'empty'">{{ t('sentencesEmpty') }}</template>
      </p>
    </form>
  </article>
</template>

<style scoped>

.write {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

.write__word {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3) var(--s-4);
}

.write__characters {
  font-size: var(--t-2xl);
  line-height: var(--lh-tight);
  font-weight: var(--w-bold);
}

.write__pinyin { font-size: var(--t-lead); }

.write__definition {
  color: var(--c-body);
  font-size: var(--t-base);
  padding-bottom: var(--s-3);
  border-bottom: var(--bw-hair) solid var(--c-rule);
}

.write__form { display: flex; flex-direction: column; gap: var(--s-2); }

.write__row { display: flex; flex-direction: column; align-items: stretch; gap: var(--s-3); }
.write__row > .btn { align-self: flex-start; flex-shrink: 0; white-space: nowrap; }

.write__input {
  width: 100%;
  min-width: 0;
  padding: var(--s-3);
  font-size: var(--t-md);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
}
.write__input:focus-visible { outline: var(--bw-heavy) solid var(--c-seal); outline-offset: 2px; }
.write__input[aria-invalid='true'] { border-color: var(--c-red); border-width: var(--bw-heavy); }

.write__msg { font-size: var(--t-base); color: var(--c-ink); font-weight: var(--w-semi); min-height: 1.4em; }
.write__msg--bad { color: var(--c-red); font-weight: var(--w-body); }

@media (min-width: 560px) {
  .write__row { flex-direction: row; align-items: stretch; }
  .write__row > .btn { align-self: auto; }
}
</style>
