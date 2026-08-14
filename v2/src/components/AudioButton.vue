<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

// Plays a word's pronunciation.
//
// Not every word has audio: the Polly pipeline fills `Audio file key` in over
// time and words added since the last run have an empty string. The Vue 2 app
// rendered a play button regardless on two of its four word cards, so those
// clicked and did nothing. Here the button is only rendered when there is
// something to play, and the caller can ask for a disabled placeholder instead
// if the layout needs one.

const props = defineProps({
  src: { type: String, default: '' },
  // Announced to screen readers, e.g. "Play pronunciation of 爱护".
  label: { type: String, default: 'this word' },
  showWhenMissing: { type: Boolean, default: false }
})

const state = ref('idle') // idle | loading | playing | error
let audio = null

const hasAudio = computed(() => Boolean(props.src))
const title = computed(() => {
  if (state.value === 'error') return 'Audio unavailable'
  if (!hasAudio.value) return 'No pronunciation recorded yet'
  return `Play pronunciation of ${props.label}`
})

function stop () {
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
}

async function play () {
  if (!hasAudio.value) return
  if (state.value === 'playing') {
    stop()
    state.value = 'idle'
    return
  }

  if (!audio) {
    audio = new Audio(props.src)
    audio.addEventListener('ended', () => { state.value = 'idle' })
    audio.addEventListener('error', () => { state.value = 'error' })
  }

  try {
    state.value = 'loading'
    await audio.play()
    state.value = 'playing'
  } catch {
    // Autoplay policies and network failures both land here. Failing quietly
    // would leave the button looking stuck.
    state.value = 'error'
  }
}

onBeforeUnmount(stop)
</script>

<template>
  <button
    v-if="hasAudio || showWhenMissing"
    type="button"
    class="audio"
    :class="[`audio--${state}`, { 'audio--muted': !hasAudio }]"
    :disabled="!hasAudio"
    :title="title"
    :aria-label="title"
    @click.stop="play"
  >
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M7.2 2.4 4.3 4.9H2.1v6.2h2.2l2.9 2.5z" />
      <template v-if="hasAudio && state !== 'error'">
        <path class="audio__wave audio__wave--near" d="M9.6 5.8a3 3 0 0 1 0 4.4" />
        <path class="audio__wave audio__wave--far" d="M11.5 3.9a5.6 5.6 0 0 1 0 8.2" />
      </template>
      <path v-else class="audio__wave" d="M10.2 6.2 13.4 9.8M13.4 6.2 10.2 9.8" />
    </svg>
  </button>
</template>

<style scoped>
.audio {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-rule);
  border-radius: var(--r-circle);
  color: var(--c-ink);
  cursor: pointer;
  transition: background-color 120ms ease-out, border-color 120ms ease-out;
}

.audio:hover:not(:disabled) {
  background-color: var(--c-button);
  border-color: var(--c-ink);
}

.audio svg { width: 17px; height: 17px; }
.audio svg path { fill: currentColor; }

.audio__wave {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
}

/* Playing: the far wave pulses, so the state is visible without colour alone. */
.audio--playing {
  background-color: var(--c-button);
  border-color: var(--c-ink);
}

.audio--playing .audio__wave--far {
  animation: audio-pulse 900ms ease-in-out infinite;
}

@keyframes audio-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.audio--loading { opacity: 0.6; }

.audio--error,
.audio--muted {
  color: var(--c-muted);
  cursor: not-allowed;
  background-color: transparent;
}

.audio--muted:hover { background-color: transparent; border-color: var(--c-rule); }

@media (prefers-reduced-motion: reduce) {
  .audio--playing .audio__wave--far { animation: none; }
}
</style>
