<script setup>
import { useI18n } from 'vue-i18n'

// Where the profile picture will go. Later, readers will pick the pixel head
// of a hero they have unlocked (Emily, 2026-11-22); until then, an empty pixel
// silhouette in a square frame.
const { t } = useI18n()
</script>

<template>
  <span class="avatar" role="img" :aria-label="t('profileAvatarPlaceholder')">
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" shape-rendering="crispEdges">
      <!-- head -->
      <rect x="6" y="3" width="4" height="1" />
      <rect x="5" y="4" width="6" height="4" />
      <rect x="6" y="8" width="4" height="1" />
      <!-- shoulders -->
      <rect x="7" y="9" width="2" height="1" />
      <rect x="4" y="10" width="8" height="1" />
      <rect x="3" y="11" width="10" height="3" />
    </svg>
  </span>
</template>

<style scoped>
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 4.5rem;
  height: 4.5rem;
  border: 2px dashed currentColor;
  opacity: 0.7;
}
.avatar svg { width: 2.5rem; height: 2.5rem; fill: currentColor; }
</style>
