<script setup>
import SiteNav from './SiteNav.vue'
import SiteFooter from './SiteFooter.vue'

// The frame every ported screen sits in: the nav (no scroll rods since
// 2026-11-27),
// then the screen's own content. Home predates this and lays out its own page
// because its sections need the widest gap; the smaller screens share this one
// so they cannot drift apart.
defineProps({
  // narrow suits a single form or message; wide suits tables and card grids.
  width: { type: String, default: 'narrow' } // narrow | wide
})
</script>

<template>
  <div class="shell">
    <div class="shell__inner">
      <SiteNav />
      <main class="shell__main" :class="`shell__main--${width}`">
        <slot />
      </main>
      <SiteFooter class="shell__footer" />
    </div>
  </div>
</template>

<style scoped>
.shell { display: flex; flex-direction: column; gap: var(--s-6); min-height: 100vh; padding: 0 0 var(--s-6); }

.shell__inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--s-12);
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--s-4);
}

.shell__main { display: flex; flex-direction: column; gap: var(--s-6); width: 100%; margin: 0 auto; }
/* At least a screen tall, so the footer starts below the fold and doesn't
   sit high on the page while the content is still loading (Emily, 2026-11-24). */
.shell__main { flex: 1; min-height: 100vh; min-height: 100dvh; }
.shell__main--narrow { max-width: 34rem; }
.shell__main--wide { max-width: none; }
.shell__footer { margin-top: var(--s-16); }
</style>
