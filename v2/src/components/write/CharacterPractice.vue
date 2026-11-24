<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import HanziWriter from 'hanzi-writer'
import { strokeDataUrl } from '../../lib/writing'

// One character to write in a 田字格 grid with Hanzi Writer: the reader draws
// each stroke with a finger or mouse; a wrong stroke is not accepted, and after
// two misses the next stroke flashes as a hint. "Show me" plays the stroke
// order, then lets them write it again. Emits "done" once written.
const props = defineProps({
  char: { type: String, required: true },
  size: { type: Number, default: 200 },
  done: { type: Boolean, default: false }
})
const emit = defineEmits(['done'])
const { t } = useI18n()

const target = ref(null)
const state = ref('loading') // loading | writing | watching | done | error
let writer = null

const css = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

function loadStrokes (char, onLoad, onError) {
  fetch(strokeDataUrl(char))
    .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.json() })
    .then(onLoad)
    .catch(onError)
}

function startQuiz () {
  state.value = 'writing'
  writer.quiz({
    showHintAfterMisses: 2,
    highlightOnComplete: true,
    onComplete: () => {
      state.value = 'done'
      emit('done')
    }
  })
}

function showMe () {
  if (!writer) return
  writer.cancelQuiz()
  state.value = 'watching'
  writer.showCharacter()
  writer.animateCharacter({ onComplete: () => { writer.hideCharacter(); startQuiz() } })
}

function again () {
  if (!writer) return
  writer.hideCharacter()
  startQuiz()
}

onMounted(() => {
  const ink = css('--c-ink', '#1B2140')
  writer = HanziWriter.create(target.value, props.char, {
    width: props.size,
    height: props.size,
    padding: Math.round(props.size * 0.06),
    showCharacter: false,
    showOutline: true,
    strokeColor: ink,
    radicalColor: ink,
    outlineColor: css('--c-rule', '#D8CDB8'),
    drawingColor: ink,
    highlightColor: css('--c-red', '#C93F1F'),
    drawingWidth: Math.max(4, Math.round(props.size / 40)),
    strokeAnimationSpeed: 1.2,
    delayBetweenStrokes: 250,
    charDataLoader: loadStrokes,
    onLoadCharDataError: () => { state.value = 'error' },
    onLoadCharDataSuccess: () => {
      if (props.done) { writer.showCharacter(); state.value = 'done' } else startQuiz()
    }
  })
})

onBeforeUnmount(() => { writer?.cancelQuiz?.() })

watch(() => props.size, (size) => writer?.updateDimensions({ width: size, height: size }))
</script>

<template>
  <div class="practice" :class="`practice--${state}`" :style="{ width: `${size}px` }">
    <!-- The grid is drawn behind; Hanzi Writer draws into the box. -->
    <div class="practice__box" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg class="practice__grid" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="50" y1="0" x2="50" y2="100" />
        <line x1="0" y1="0" x2="100" y2="100" />
        <line x1="100" y1="0" x2="0" y2="100" />
      </svg>
      <div ref="target" class="practice__writer" role="img"
        :aria-label="t('writeCharLabel', { char })" />
      <p v-if="state === 'error'" class="practice__error">{{ t('writeLoadError', { char }) }}</p>
    </div>
    <div class="practice__actions">
      <button type="button" class="practice__btn" :disabled="state === 'loading' || state === 'error' || state === 'watching'" @click="showMe">
        {{ t('writeShowMe') }}
      </button>
      <button type="button" class="practice__btn" :disabled="state === 'loading' || state === 'error' || state === 'watching'" @click="again">
        {{ t('writeAgain') }}
      </button>
    </div>
    <p class="sr-only" role="status">{{ state === 'done' ? t('writeCharDone', { char }) : '' }}</p>
  </div>
</template>

<style scoped>
.practice { display: flex; flex-direction: column; align-items: center; gap: var(--s-3); }
.practice__box {
  position: relative;
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  touch-action: none; /* drawing, not scrolling, inside the box */
}
.practice--done .practice__box { border-color: var(--c-ink); box-shadow: var(--shadow-hard); }
.practice__grid { position: absolute; inset: 0; width: 100%; height: 100%; }
.practice__grid line { stroke: var(--c-red); stroke-width: 0.4; stroke-dasharray: 2 2; opacity: 0.45; vector-effect: non-scaling-stroke; }
.practice__writer { position: absolute; inset: 0; }
.practice__error { position: absolute; inset: 0; display: grid; place-items: center; padding: var(--s-4); text-align: center; font-size: var(--t-base); color: var(--c-body); }
.practice__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--s-1) var(--s-4); text-align: center; }
.practice__btn {
  padding: 0;
  font: inherit;
  font-size: var(--t-base);
  color: var(--c-ink);
  background: none;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  cursor: pointer;
}
.practice__btn:disabled { opacity: 0.4; cursor: default; }
</style>
