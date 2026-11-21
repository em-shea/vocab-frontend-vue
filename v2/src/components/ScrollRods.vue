<script setup>
// The rods a hanging scroll is wound on. One sits at the top of the page and one
// at the bottom, framing the whole document as a single scroll.
//
// Decorative only, so it is hidden from assistive technology.
defineProps({
  position: { type: String, default: 'top' } // top | bottom
})
</script>

<template>
  <div class="rod" :class="`rod--${position}`" aria-hidden="true">
    <span class="rod__bar"></span>
  </div>
</template>

<style scoped>
.rod {
  display: flex;
  align-items: center;
  width: 100%;
}

.rod__bar {
  flex: 1 1 auto;
  height: 10px;
  background-color: var(--c-ink);
  /* A lighter core suggests a turned wooden rod rather than a flat bar. */
  background-image: linear-gradient(
    to bottom,
    var(--c-ink) 0%,
    var(--c-body) 45%,
    var(--c-ink) 100%
  );
}
</style>
