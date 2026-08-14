<script setup>
// Every section opens with this: a seal-red brush mark, an uppercase label, and
// a hairline rule running to the edge. The optional Chinese title sits under the
// label in the serif face.
defineProps({
  label: { type: String, required: true },
  title: { type: String, default: '' },
  hanzi: { type: String, default: '' }
})
</script>

<template>
  <header class="section-head">
    <div class="section-head__top">
      <span class="section-head__mark" aria-hidden="true"></span>
      <span class="section-head__label">{{ label }}</span>
      <span class="section-head__rule" aria-hidden="true"></span>
    </div>
    <h2 v-if="title || hanzi" class="section-head__title">
      <span v-if="hanzi" class="hanzi section-head__hanzi">{{ hanzi }}</span>
      <span v-if="title">{{ title }}</span>
    </h2>
  </header>
</template>

<style scoped>
.section-head {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.section-head__top {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}

/* The brush mark: a short seal-red stroke, slightly angled so it reads as ink
 * rather than a UI bar. */
.section-head__mark {
  flex: 0 0 auto;
  width: 26px;
  height: 7px;
  background-color: var(--c-seal);
  clip-path: polygon(0 22%, 100% 0, 96% 100%, 4% 78%);
}

.section-head__label {
  flex: 0 0 auto;
  font-family: var(--f-label);
  font-size: var(--t-sm);
  font-weight: var(--w-semi);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--c-muted);
}

.section-head__rule {
  flex: 1 1 auto;
  height: 1px;
  background-color: var(--c-rule);
}

.section-head__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s-3);
}

.section-head__hanzi {
  font-size: var(--t-xl);
  font-weight: var(--w-bold);
}
</style>
