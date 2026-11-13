<script setup>
// Holds a woodblock print: a 4px ink frame with a faint halftone dot overlay,
// so artwork reads as printed on the same paper rather than pasted on top.
//
// The halftone is a CSS dot grid rather than an image, so it costs nothing and
// scales with the frame.
defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  ratio: { type: String, default: '4 / 5' }
})
</script>

<template>
  <figure class="print" :style="{ aspectRatio: ratio }">
    <img v-if="src" class="print__img" :src="src" :alt="alt" />
    <div v-else class="print__placeholder" aria-hidden="true">
      <span class="brush">印</span>
    </div>
    <div class="print__halftone" aria-hidden="true"></div>
  </figure>
</template>

<style scoped>
.print {
  position: relative;
  margin: 0;
  /* Heavy, square ink frame — the design frames every print this way (4px solid
   * ink, no radius). Rounding it makes the artwork read as a UI card rather than
   * something printed. */
  border: var(--bw-frame) solid var(--c-ink);
  border-radius: 0;
  background-color: var(--c-panel);
  overflow: hidden;
}

.print__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Shown in full colour, unfiltered: these are colour woodblocks and the
   * colour is the thing worth showing. */
}

.print__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--c-ground);
  color: var(--c-rule);
  font-size: var(--t-3xl);
}

.print__halftone {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(27, 33, 64, 0.12) 0.9px, transparent 1px);
  background-size: 4px 4px;
  mix-blend-mode: multiply;
}
</style>
