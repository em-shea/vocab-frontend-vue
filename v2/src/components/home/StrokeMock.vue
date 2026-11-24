<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HanziWriter from 'hanzi-writer'
import hao from '../../data/strokes/hao.json'

// The home page's stroke order picture: 好 drawn stroke by stroke on a loop,
// with Hanzi Writer, as on the practice page. The stroke data is bundled
// (2 KB), so the home page fetches nothing for it. With reduced motion, the
// finished character stands still.
const target = ref(null)
let writer = null

onMounted(() => {
  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const size = target.value.clientWidth || 144
  writer = HanziWriter.create(target.value, '好', {
    width: size,
    height: size,
    padding: Math.round(size * 0.08),
    showOutline: true,
    showCharacter: still,
    strokeColor: css('--c-ink', '#1B2140'),
    outlineColor: css('--c-rule', '#D9D2C2'),
    strokeAnimationSpeed: 0.8,
    delayBetweenStrokes: 300,
    delayBetweenLoops: 1800,
    charDataLoader: (_char, onLoad) => onLoad(hao)
  })
  if (!still) writer.loopCharacterAnimation()
})

onBeforeUnmount(() => { writer?.pauseAnimation?.() })
</script>

<template>
  <div ref="target" class="stroke-mock" />
</template>

<style scoped>
.stroke-mock { position: relative; z-index: 1; width: 100%; height: 100%; }
</style>
