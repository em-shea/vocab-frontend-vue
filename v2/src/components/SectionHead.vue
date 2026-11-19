<script setup>
// Every section opens with this: a thin rule and the heading under it. The
// optional Chinese title sits beside the heading in the serif face. `label` is
// still accepted so older callers do not break, but it is no longer rendered.
defineProps({
  label: { type: String, default: '' },
  title: { type: String, default: '' },
  hanzi: { type: String, default: '' },
  // Heading level, so a section nested under another heading can be an h3.
  as: { type: String, default: 'h2' }
})
</script>

<template>
  <header class="section-head">
    <span class="section-head__rule" aria-hidden="true"></span>
    <component :is="as" v-if="title || hanzi || $slots.default" class="section-head__title">
      <span v-if="hanzi" class="hanzi section-head__hanzi">{{ hanzi }}</span>
      <!-- The default slot replaces `title`, for a title that holds a link. -->
      <span v-if="title || $slots.default"><slot>{{ title }}</slot></span>
    </component>
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
