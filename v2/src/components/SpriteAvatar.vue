<script setup>
import { useI18n } from 'vue-i18n'

// Profile picture: the pixel head of a hero sprite. Later a learner picks the
// head of a hero they have unlocked (Emily, 2026-11-22), made with PixelLab
// like the hero sprites; pass it as `src` (a small PNG, drawn pixel-sharp).
// Until then every profile shows a plain pixel silhouette (head and
// shoulders): navy on light pages, light on the navy name card.
const props = defineProps({
  src: { type: String, default: null },
  size: { type: String, default: 'md' }, // sm (leaderboard) | md (name card) | lg (public profile)
  onDark: { type: Boolean, default: false }, // the navy profile name card
  label: { type: String, default: null },
  // Beside a name that already says who it is (leaderboard rows).
  decorative: { type: Boolean, default: false }
})
const { t } = useI18n()
</script>

<template>
  <span class="sprite-avatar" :class="[`sprite-avatar--${props.size}`, { 'sprite-avatar--dark': props.onDark }]"
        v-bind="props.decorative ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': props.label ?? t('profileAvatarPlaceholder') }">
    <img v-if="props.src" :src="props.src" alt="" class="sprite-avatar__img">
    <svg v-else viewBox="0 0 16 16" aria-hidden="true" focusable="false" shape-rendering="crispEdges">
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
.sprite-avatar {
  display: block;
  flex: none;
  overflow: hidden;
  background: var(--c-sunk);
}
.sprite-avatar--sm { width: 2rem; height: 2rem; }
.sprite-avatar--md { width: 4.5rem; height: 4.5rem; }
.sprite-avatar--lg { width: 6rem; height: 6rem; }
.sprite-avatar svg, .sprite-avatar__img { display: block; width: 100%; height: 100%; }
.sprite-avatar__img { object-fit: contain; image-rendering: pixelated; }
.sprite-avatar svg { fill: var(--c-ink); }
/* The navy name card: a step lighter than the card, light figure (as before). */
.sprite-avatar--dark { background-color: color-mix(in srgb, var(--c-ground) 14%, transparent); }
.sprite-avatar--dark svg { fill: var(--c-ground); opacity: 0.55; }
</style>
