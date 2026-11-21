<script setup>
import { useI18n } from 'vue-i18n'

// A checklist box beside a task: empty while it is still to do, navy with a
// white tick once done. Square, to match the site's corners. Screen readers
// hear "done" or "not done yet"; the box itself is decorative.
defineProps({ done: { type: Boolean, default: false } })
const { t } = useI18n()
</script>

<template>
  <span class="taskbox" :class="{ 'taskbox--done': done }">
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="14" height="14" />
      <path v-if="done" d="M4 8.2l2.6 2.6L12 5.4" />
    </svg>
    <span class="sr-only">{{ done ? t('profileDone') : t('profileNotDone') }}</span>
  </span>
</template>

<style scoped>
.taskbox { display: inline-flex; flex: none; }
.taskbox svg { display: block; }
rect { fill: var(--c-panel); stroke: var(--c-ink); stroke-width: 1.5; }
path { fill: none; stroke: var(--c-on-red); stroke-width: 2; stroke-linecap: square; }
.taskbox--done rect { fill: var(--c-ink); }
</style>
