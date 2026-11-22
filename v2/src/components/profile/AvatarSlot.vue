<script setup>
import { useI18n } from 'vue-i18n'

// Where the profile picture goes. Later, readers will pick the pixel head of a
// hero they have unlocked (Emily, 2026-11-22); until then, a plain pixel
// portrait on a lighter square, like an empty card in an album.
const { t } = useI18n()
</script>

<template>
  <span class="avatar" role="img" :aria-label="t('profileAvatarPlaceholder')">
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" shape-rendering="crispEdges">
      <!-- head -->
      <rect x="6" y="3" width="4" height="1" />
      <rect x="5" y="4" width="6" height="4" />
      <rect x="6" y="8" width="4" height="1" />
      <!-- neck and shoulders, down to the bottom edge -->
      <rect x="7" y="9" width="2" height="1" />
      <rect x="4" y="10" width="8" height="1" />
      <rect x="3" y="11" width="10" height="5" />
    </svg>
  </span>
</template>

<style scoped>
.avatar {
  display: block;
  flex: none;
  width: 4.5rem;
  height: 4.5rem;
  overflow: hidden;
  /* A step lighter than the navy card. */
  background-color: color-mix(in srgb, var(--c-ground) 14%, transparent);
}
.avatar svg { display: block; width: 100%; height: 100%; fill: var(--c-ground); opacity: 0.55; }
</style>
