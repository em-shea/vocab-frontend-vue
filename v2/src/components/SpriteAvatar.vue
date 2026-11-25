<script setup>
import { useI18n } from 'vue-i18n'

// Profile picture: the pixel head of a hero sprite. Later a learner picks the
// head of a hero they have unlocked (Emily, 2026-11-22), made with PixelLab
// like the hero sprites; pass it as `src` (a small PNG, drawn pixel-sharp).
// Until then every profile shows this placeholder head: a Liangshan figure
// with a topknot and a red headband, drawn on a 16 × 16 grid.
const props = defineProps({
  src: { type: String, default: null },
  size: { type: String, default: 'md' }, // sm (leaderboard) | md (name card) | lg (public profile)
  label: { type: String, default: null },
  // Beside a name that already says who it is (leaderboard rows).
  decorative: { type: Boolean, default: false }
})
const { t } = useI18n()

// [x, y, width, height, part] on the 16 × 16 grid.
const PIXELS = [
  [7, 1, 2, 2, 'hair'],           // topknot
  [5, 3, 6, 1, 'hair'],
  [4, 4, 8, 1, 'hair'],
  [4, 5, 8, 1, 'band'],           // headband
  [4, 6, 1, 2, 'hair'], [11, 6, 1, 2, 'hair'],
  [5, 6, 6, 4, 'skin'],
  [6, 7, 1, 1, 'ink'], [9, 7, 1, 1, 'ink'],   // eyes
  [7, 9, 2, 1, 'mouth'],
  [6, 10, 4, 1, 'skin'],          // chin
  [7, 11, 2, 1, 'skin'],          // neck
  [3, 12, 10, 4, 'robe'],
  [6, 12, 4, 1, 'collar'], [7, 13, 2, 1, 'collar']
]
</script>

<template>
  <span class="sprite-avatar" :class="`sprite-avatar--${props.size}`" v-bind="props.decorative ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': props.label ?? t('profileAvatarPlaceholder') }">
    <img v-if="props.src" :src="props.src" alt="" class="sprite-avatar__img">
    <svg v-else viewBox="0 0 16 16" aria-hidden="true" focusable="false" shape-rendering="crispEdges">
      <rect v-for="([x, y, w, h, part], i) in PIXELS" :key="i" :x="x" :y="y" :width="w" :height="h" :class="`p-${part}`" />
    </svg>
  </span>
</template>

<style scoped>
.sprite-avatar {
  display: block;
  flex: none;
  overflow: hidden;
  background: var(--c-sunk);
  border: var(--bw-rule) solid var(--c-ink);
}
.sprite-avatar--sm { width: 2rem; height: 2rem; }
.sprite-avatar--md { width: 4.5rem; height: 4.5rem; }
.sprite-avatar--lg { width: 6rem; height: 6rem; box-shadow: var(--shadow-hard); }
.sprite-avatar svg, .sprite-avatar__img { display: block; width: 100%; height: 100%; }
.sprite-avatar__img { object-fit: contain; image-rendering: pixelated; }

.p-hair, .p-ink { fill: var(--c-ink); }
.p-band, .p-collar { fill: var(--c-seal); }
.p-skin { fill: var(--c-gold-light); }
.p-mouth { fill: #B8875A; }
.p-robe { fill: var(--c-pinyin); }
</style>
