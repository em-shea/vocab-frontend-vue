<script setup>
// Every section opens with this: a thin rule and the heading under it. The
// optional Chinese title sits beside the heading in the serif face. `label` is
// still accepted so older callers do not break, but it is no longer rendered.
defineProps({
  label: { type: String, default: '' },
  title: { type: String, default: '' },
  hanzi: { type: String, default: '' }
})
</script>

<template>
  <header class="section-head">
    <span class="section-head__rule" aria-hidden="true"></span>
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

.section-head__rule {
  display: block;
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
