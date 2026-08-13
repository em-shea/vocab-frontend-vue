<script setup>
// A lifted surface on the paper ground. `framed` adds the ink border and hard
// shadow; plain panels sit flush and rely on the tonal step alone.
defineProps({
  framed: { type: Boolean, default: true },
  band: { type: Boolean, default: false }
})
</script>

<template>
  <section class="panel" :class="{ 'panel--framed': framed, 'panel--band': band }">
    <slot />
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-6);
  background-color: var(--c-panel);
  color: var(--c-body);
}

.panel--framed {
  border: var(--border-w) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

/* The dark band inverts the panel. Gold is only legible here, which is why the
 * token is documented as band-only. */
.panel--band {
  background-color: var(--c-band);
  color: var(--c-band-text);
}

.panel--band :deep(h1),
.panel--band :deep(h2),
.panel--band :deep(h3),
.panel--band :deep(h4) {
  color: var(--c-band-text);
}
</style>
