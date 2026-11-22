<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../AppButton.vue'
import WordCard from '../WordCard.vue'
import { fieldText } from '../../lib/quiz'
import { useDefinition } from '../../lib/cnDefinitions'
import { usePreferencesStore } from '../../stores/preferences'

// One question: a prompt, four options, then the marks and the way on.
//
// Colour is never the only signal. The chosen and correct options also carry
// a mark and words for screen readers, and the result is announced.

const props = defineProps({
  question: { type: Object, required: true }, // { answer, options, type } from lib/quiz
  last: { type: Boolean, default: false }
})
const emit = defineEmits(['answer', 'next'])
const { t } = useI18n()
const prefs = usePreferencesStore()

const chosen = ref(null)
const showWords = ref(false)
const prompt = ref(null)
const nextButton = ref(null)

// Definitions follow 中文 mode, like the word cards. Which options are offered
// is still decided on the English (lib/quiz), so this only changes the text.
const definitionOf = useDefinition()
const text = (entry, field) => field === 'definition' ? definitionOf(entry?.word) : fieldText(entry, field, prefs.characterSet)
const promptText = computed(() => text(props.question.answer, props.question.type.question))

const CHOOSE = { definition: 'quizChooseDefinition', pinyin: 'quizChoosePinyin', characters: 'quizChooseCharacters' }
const instruction = computed(() => t(CHOOSE[props.question.type.answers]))

// Characters in the study face, pinyin in its colour, definitions as text.
const styleFor = (field) => ({ characters: 'hanzi', pinyin: 'pinyin', definition: 'is-definition' })[field]

const answered = computed(() => chosen.value !== null)
const correct = computed(() => chosen.value === props.question.answer)

function choose (entry) {
  if (answered.value) return
  chosen.value = entry
  emit('answer', { chosen: entry, correct: entry === props.question.answer })
  // Keyboard users land on the way forward rather than back at the top.
  nextTick(() => nextButton.value?.$el?.focus())
}

function state (entry) {
  if (!answered.value) return ''
  if (entry === props.question.answer) return 'right'
  if (entry === chosen.value) return 'wrong'
  return 'other'
}

// A new question resets the card and moves focus to its prompt.
watch(() => props.question, () => {
  chosen.value = null
  showWords.value = false
  nextTick(() => prompt.value?.focus())
})

defineExpose({ focusPrompt: () => prompt.value?.focus() })
</script>

<template>
  <section class="question">
    <h2 ref="prompt" class="question__prompt" :class="styleFor(question.type.question)" tabindex="-1">
      {{ promptText }}
    </h2>
    <p class="sr-only">{{ instruction }}</p>

    <ul class="question__options">
      <li v-for="entry in question.options" :key="entry.word.word_id ?? entry.word.simplified">
        <button
          type="button"
          class="option"
          :class="[styleFor(question.type.answers), state(entry) && `option--${state(entry)}`]"
          :disabled="answered"
          :aria-pressed="entry === chosen"
          @click="choose(entry)"
        >
          <span class="option__text">{{ text(entry, question.type.answers) }}</span>
          <span v-if="state(entry) === 'right'" class="option__mark" aria-hidden="true">✓</span>
          <span v-else-if="state(entry) === 'wrong'" class="option__mark" aria-hidden="true">✗</span>
        </button>
      </li>
    </ul>

    <p class="sr-only" role="status">
      <template v-if="answered">
        {{ correct ? t('quizCorrect') : t('quizWrong', { answer: text(question.answer, question.type.answers) }) }}
      </template>
    </p>

    <div v-if="answered" class="question__after">
      <AppButton ref="nextButton" variant="primary" @click="emit('next')">
        {{ last ? t('quizFinish') : t('quizNext') }}
      </AppButton>
      <button type="button" class="question__toggle" :aria-expanded="showWords" @click="showWords = !showWords">
        {{ showWords ? t('quizHideWords') : t('quizShowWords') }}
      </button>
    </div>

    <ul v-if="answered && showWords" class="question__words">
      <li v-for="entry in question.options" :key="entry.word.word_id ?? entry.word.simplified">
        <WordCard :word="entry.word" compact />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.question { display: flex; flex-direction: column; gap: var(--s-4); }

.question__prompt {
  margin: var(--s-4) 0 0;
  font-size: var(--t-3xl);
  line-height: var(--lh-tight);
  color: var(--c-ink);
  outline: none;
  overflow-wrap: anywhere;
}
.question__prompt.pinyin { font-size: var(--t-2xl); }
.question__prompt.is-definition { font-family: var(--f-ui); font-size: var(--t-lg); font-weight: var(--w-semi); line-height: var(--lh-snug); }


.question__options {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  width: 100%;
  min-height: 3.5rem;
  padding: var(--s-3) var(--s-4);
  font-family: var(--f-ui);
  text-align: left;
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  cursor: pointer;
  transition: transform 90ms ease-out, box-shadow 90ms ease-out;
}
.option:hover:not(:disabled) { background-color: var(--c-panel); }
.option:active:not(:disabled) { transform: translate(3px, 3px); box-shadow: none; }
.option:focus-visible { outline: 2px solid var(--c-red); outline-offset: 3px; }
.option:disabled { cursor: default; }

.option.hanzi { font-family: var(--f-hanzi); }
.option.pinyin { font-family: var(--f-label); }
.option.hanzi .option__text { font-size: var(--t-lg); }
.option.pinyin .option__text { font-size: var(--t-lead); }
.option.is-definition .option__text {
  font-size: var(--t-body);
  /* Some definitions run to a dozen senses; three lines is enough to choose. */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.option--right { background-color: var(--c-button); color: var(--c-on-button); }
.option--right .option__text { color: var(--c-on-button); }
.option--wrong { background-color: var(--c-red-solid); color: var(--c-on-red); border-color: var(--c-red-solid); }
.option--wrong .option__text { color: var(--c-on-red); }
.option--other { opacity: 0.55; box-shadow: none; }

.option__mark { font-size: var(--t-lg); font-weight: var(--w-bold); flex: none; }

/* Instruction and result use the global .sr-only: read out but not shown,
   since the options and the ✓/✗ marks say the same thing on screen. */

.question__after { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }

.question__toggle {
  padding: 0;
  font: inherit;
  font-size: var(--t-base);
  color: var(--c-ink);
  background: none;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.question__words {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.question__words > li { display: flex; }
.question__words > li > * { flex: 1; }

@media (min-width: 720px) {
  .question__options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
