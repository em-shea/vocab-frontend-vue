<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HanziWriter from 'hanzi-writer'
import hao from '../data/strokes/hao.json'

// Shown while a page waits for the API: 好 written stroke by stroke in a
// 田字格 box, on a loop, above the loading line (Emily, 2026-11-27). Same
// bundled stroke data as the home page's stroke order picture, so nothing is
// fetched for it. Fades in after a moment so quick loads don't flash it. With
// reduced motion the finished character stands still.
defineProps({ label: { type: String, required: true } })

const SIZE = 80
const target = ref(null)
let writer = null

onMounted(() => {
  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  writer = HanziWriter.create(target.value, '好', {
    width: SIZE,
    height: SIZE,
    padding: 8,
    showOutline: true,
    showCharacter: still,
    strokeColor: css('--c-seal', '#C93F1F'),
    outlineColor: css('--c-rule', '#D9D2C2'),
    strokeAnimationSpeed: 1.6,
    delayBetweenStrokes: 80,
    delayBetweenLoops: 500,
    charDataLoader: (_char, onLoad) => onLoad(hao)
  })
  if (!still) writer.loopCharacterAnimation()
})

onBeforeUnmount(() => { writer?.pauseAnimation?.() })
</script>

<template>
  <div class="loading" role="status">
    <div class="loading__box" aria-hidden="true">
      <div ref="target" class="loading__char" />
    </div>
    <p class="loading__label">{{ label }}</p>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  grid-column: 1 / -1; /* centred across the page even inside a two-column grid */
  width: 100%;
  padding-block: var(--s-12, 6rem);
  animation: loading-in 200ms ease-out 250ms both;
}
.loading__box {
  position: relative;
  width: 80px;
  height: 80px;
  box-shadow: var(--shadow-hard);
  border: var(--bw-rule) solid var(--c-ink);
  background-color: var(--c-panel);
  /* 田字格 guide lines */
  background-image:
    linear-gradient(to right, transparent calc(50% - 0.5px), var(--c-rule) calc(50% - 0.5px), var(--c-rule) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
    linear-gradient(to bottom, transparent calc(50% - 0.5px), var(--c-rule) calc(50% - 0.5px), var(--c-rule) calc(50% + 0.5px), transparent calc(50% + 0.5px));
}
.loading__char { position: absolute; inset: 0; }
.loading__label { margin: 0; color: var(--c-muted); font-size: var(--t-sm); }

@keyframes loading-in { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .loading { animation: none; } }
</style>
