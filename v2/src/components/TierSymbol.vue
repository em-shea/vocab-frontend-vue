<script>
let nextId = 0
</script>

<script setup>
import { computed } from 'vue'

// The tier emblem on a hero card, drawn like a Magic: The Gathering set symbol:
// a metallic vertical gradient inside a crisp navy outline, a hard 2px 2px navy
// offset shadow (the house hard-shadow style), and the hero's rank on top in
// paper with a navy halo. Heavenly Spirits (天罡) get a cloud ring, in gold
// fading to vermilion; Earthly Fiends (地煞) get peaks, in silver fading to navy.
//
// Icons: "Cloud ring" and "Peaks" by Lorc, https://game-icons.net, CC BY 3.0
// (credited in the print viewer and in CREDITS.md). The paths are inlined from
// the 512 x 512 originals.
//
// `size` 'md' is 2.75rem (44px), 'sm' is 2rem (32px). The SVG is the whole
// footprint: the outline and the shadow are drawn inside it, so nothing is
// clipped and the layout box is the same as the old round/square seal. It is
// decorative (aria-hidden); the card carries the rank and tier in screen-reader
// text.
const props = defineProps({
  tier: { type: String, required: true, validator: (v) => ['heavenly', 'earthly'].includes(v) },
  rank: { type: Number, required: true },
  size: { type: String, default: 'md', validator: (v) => ['md', 'sm'].includes(v) }
})

const ICONS = {
  heavenly: {
    stops: ['#F3D9A0', '#E08A3C', '#C8321E'],
    // Mass centre of the drawn shape, in the 512 box.
    cx: 271, cy: 233,
    d: 'M245.22 31.387c-70.06.15-134.335 31.794-168.1 90.28c-5.223 9.045-8.83 18.417-12.24 28C122.157 70.996 219.372 40.6 292.07 82.57c78.822 45.506 98.658 158.253 44.405 252.223c-25.855 44.782-63.857 77.026-105.15 93.723c95.38 29.26 195.698-.307 240.96-78.704c54.027-93.574 8.905-220.773-100.055-283.68c-40.858-23.59-84.976-34.837-127.01-34.747zm-24.763 49.945c-40.357.123-84.108 16.545-122.254 49.408C19.45 198.588-6.02 311.192 41.32 382.244c4.577 6.87 9.9 12.55 15.434 18.137C20.79 331.21 31.144 244.728 83.69 199.46c56.97-49.083 141.443-31.06 188.98 40.292c22.654 34.003 32.705 73.913 30.926 111.78c51.07-67.13 63.006-155.83 23.347-215.356h-.002C302.534 99.54 263.42 81.2 220.458 81.332zm-63.36 107.71c-26.76.083-53.228 9.95-73.05 29.65c-48.848 48.55-47.855 142.19 1.144 205.94c49 63.75 128.323 76.074 177.17 27.524c-47.107 29.645-84.88 26.3-128.778-20.916c-39.45-42.43-24.435-122.8 24.62-171.554c23.376-23.234 51.128-35.812 77.675-37.696c-21.48-22.033-50.296-33.034-78.78-32.947z'
  },
  earthly: {
    stops: ['#B9C2D6', '#5A6585', '#1B2140'],
    cx: 241, cy: 318,
    d: 'm245.795 19.12l-52.363 153.513l26.67 61.937l38.884-52.37l53.217 67.493l11.682-40.486zM101.172 193.69l-29.06 80.222l24.54-12.715l24.803 14.33l11.64-48.013l-31.923-33.825zm83.267 5.308l-20.776 60.904l-15.27-16.177l-14.662 60.48l-37.568-21.707l-33.44 17.324L19.04 420.42l84.884 30.937l73.418-22.437l73.935 19.47l71.66-21.536l91.973 25.226l77.28-31.66l-48.44-89.006l-39.045 26.664l-38.892-27.576l-27.153 42.79l-15.78-10.013l39.032-61.51l-26.6-64.752l-15.246 52.83l-60.634-76.9l-43.664 58.81l-31.33-72.76zm223.06 65.81L375.84 314.7l29.066 20.61l29.865-20.394l-27.27-50.11z'
  }
}

const uid = `ts${nextId++}`
const icon = computed(() => ICONS[props.tier])

// Geometry in CSS px, converted to 512-box units (u per px) so the outline and
// shadow come out as whole device-friendly widths whatever the size.
const OUTLINE = 1.5
const SHADOW = 2
const px = computed(() => (props.size === 'sm' ? 32 : 44))
const iconPx = computed(() => px.value - 2 * OUTLINE - SHADOW)
const u = computed(() => 512 / iconPx.value)
const viewBox = computed(() => `${-OUTLINE * u.value} ${-OUTLINE * u.value} ${px.value * u.value} ${px.value * u.value}`)
const digits = computed(() => String(props.rank).length)
const fontPx = computed(() => iconPx.value * (digits.value >= 3 ? 0.36 : digits.value === 2 ? 0.46 : 0.52))
const font = computed(() => fontPx.value * u.value)
// Optical centre: the middle of the cap height sits on the mass centre.
const ty = computed(() => icon.value.cy + font.value * 0.36)
</script>

<template>
  <svg
    class="tier-symbol"
    :class="`tier-symbol--${size}`"
    :data-tier="tier"
    :data-icon="tier === 'heavenly' ? 'cloud-ring' : 'peaks'"
    :viewBox="viewBox"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="`${uid}-g`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="icon.stops[0]" />
        <stop offset="0.5" :stop-color="icon.stops[1]" />
        <stop offset="1" :stop-color="icon.stops[2]" />
      </linearGradient>
      <filter :id="`${uid}-f`" filterUnits="userSpaceOnUse" x="-100" y="-100" :width="512 + 200 + 2 * u" :height="512 + 200 + 2 * u" color-interpolation-filters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" :radius="OUTLINE * u" result="grown" />
        <feFlood flood-color="#1B2140" />
        <feComposite in2="grown" operator="in" result="outline" />
        <feOffset in="outline" :dx="SHADOW * u" :dy="SHADOW * u" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path :d="icon.d" :fill="`url(#${uid}-g)`" :filter="`url(#${uid}-f)`" />
    <text
      class="tier-symbol__rank"
      :x="icon.cx"
      :y="ty"
      text-anchor="middle"
      :font-size="font"
      :stroke-width="font * 0.17"
    >{{ rank }}</text>
  </svg>
</template>

<style scoped>
.tier-symbol { flex: none; display: block; overflow: visible; }
.tier-symbol--md { width: 2.75rem; height: 2.75rem; }
.tier-symbol--sm { width: 2rem; height: 2rem; }
.tier-symbol__rank {
  font-family: var(--f-display);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  fill: var(--c-ground);
  stroke: var(--c-ink);
  stroke-linejoin: round;
  paint-order: stroke fill;
}
</style>
