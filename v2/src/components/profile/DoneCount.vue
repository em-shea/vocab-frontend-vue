<script setup>
import { useI18n } from 'vue-i18n'

// "1/2" beside a section heading: how many of today's words have this done.
defineProps({ count: { type: Object, required: true } }) // { done, total }
const { t } = useI18n()
</script>

<template>
  <span v-if="count.total" class="done-count" :class="{ 'done-count--all': count.done === count.total }">
    <span aria-hidden="true">{{ count.done }}/{{ count.total }}</span>
    <span class="sr-only">{{ t('profileDoneCount', { done: count.done, total: count.total }) }}</span>
  </span>
</template>

<style scoped>
.done-count {
  margin-left: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  vertical-align: middle;
}
.done-count--all { color: var(--c-ink); }
</style>
