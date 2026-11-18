<script setup>
import { computed, inject, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

// One line of card text in Chinese, with an English line beneath. Used by
// HeroCard for the fact values (star, weapon, background) and the quote.
//
// `pinyin` is space-separated syllables, one per Chinese character (punctuation
// and spaces take none). If the counts do not match the line is shown as plain
// text with no pinyin (and a warning is logged in development).
//
// Pinyin is on demand, as a pop-up. With `ruby` set (guided mode) the Chinese is
// a real button. Hovering it (pointer devices) shows a small navy bubble just
// above the line, left-aligned with it, holding the syllables; clicking,
// tapping or pressing Enter/Space pins it open (aria-pressed), and again hides
// it. The bubble is absolutely positioned, so it never moves anything. A dotted
// underline under the Chinese marks a line with pinyin behind it; it turns solid
// vermilion while the bubble is shown.
//
// HeroCard provides `heroPinyin` ({ openId }) so that only one bubble is pinned
// per card; without it (used alone) the line keeps its own state.
//
// The plain Chinese sits in visually hidden text for screen readers; the button
// is named "Show pinyin: <line>", and points at the bubble with aria-describedby
// while it is shown. The English line stays visible and readable.
const props = defineProps({
  cn: { type: String, required: true },
  pinyin: { type: String, default: '' },
  en: { type: String, default: '' },
  ruby: { type: Boolean, default: false }
})

const { t } = useI18n()
const uid = `hl-${useId()}`
const ctx = inject('heroPinyin', null)
const local = ref(false)
const open = computed(() => (ctx ? ctx.openId.value === uid : local.value))
const toggle = () => {
  if (ctx) ctx.openId.value = open.value ? null : uid
  else local.value = !local.value
}

const SKIP = /[\p{P}\p{S}\s]/u
// The pinyin as shown: single spaces between syllables. Null when it does not
// match the Chinese, one syllable per character.
const tip = computed(() => {
  if (!props.ruby || !props.pinyin) return null
  const syl = props.pinyin.trim().split(/\s+/)
  const need = [...props.cn].filter((c) => !SKIP.test(c)).length
  if (need !== syl.length) {
    if (import.meta.env.DEV) console.warn(`HeroLine: ${need} characters but ${syl.length} syllables for "${props.cn}" / "${props.pinyin}"`)
    return null
  }
  return syl.join(' ')
})
</script>

<template>
  <span class="hl">
    <template v-if="tip">
      <span class="sr-only" lang="zh-Hans">{{ cn }}</span>
      <span class="hl__line" :class="{ 'hl__line--open': open }">
        <button
          type="button"
          class="hl__btn"
          :aria-pressed="open ? 'true' : 'false'"
          :aria-label="t('heroCardShowPinyin', { text: cn })"
          :aria-describedby="open ? uid : null"
          @click="toggle"
        ><span class="hl__zh" lang="zh-Hans" aria-hidden="true">{{ cn }}</span></button>
        <span :id="uid" class="hl__tip" lang="zh-Latn-pinyin" aria-hidden="true">{{ tip }}</span>
      </span>
    </template>
    <span v-else class="hl__zh" lang="zh-Hans">{{ cn }}</span>
    <span v-if="en" class="hl__en" lang="en">{{ en }}</span>
  </span>
</template>

<style scoped>
.hl { display: flex; flex-direction: column; min-width: 0; }
.hl__zh { font-family: var(--f-hanzi); line-height: var(--hl-zh-lh, 1.4); }
.hl__line { position: relative; display: block; }
/* The Chinese line as a button that looks like text. */
.hl__btn {
  display: block;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
/* Dotted underline while the pinyin is hidden, solid vermilion while shown. */
.hl__btn .hl__zh {
  text-decoration: underline dotted;
  text-decoration-color: var(--c-muted);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.22em;
}
.hl__line--open .hl__zh {
  text-decoration-style: solid;
  text-decoration-color: var(--c-seal);
}
/* The bubble: absolutely positioned above the line, left-aligned, never in the flow. */
.hl__tip {
  position: absolute;
  left: 0;
  bottom: 100%;
  z-index: 20;
  margin-bottom: 6px;
  width: max-content;
  max-width: max(100%, 11rem);
  padding: 3px 6px;
  font-family: var(--f-ui);
  font-size: var(--t-xs);
  line-height: 1.3;
  letter-spacing: 0;
  white-space: normal;
  color: var(--c-on-button);
  background-color: var(--c-ink);
  box-shadow: 2px 2px 0 rgba(27, 33, 64, 0.3);
  pointer-events: none;
  visibility: hidden;
}
.hl__tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 8px;
  border: 4px solid transparent;
  border-top-color: var(--c-ink);
  border-bottom-width: 0;
}
.hl__line--open .hl__tip { visibility: visible; }
@media (hover: hover) {
  .hl__line:hover .hl__tip { visibility: visible; }
  .hl__line:hover .hl__zh { text-decoration-style: solid; text-decoration-color: var(--c-seal); }
}
.hl__en { font-family: var(--f-ui); font-size: var(--hl-en-size, var(--t-sm)); line-height: var(--lh-snug); color: var(--hl-en-color, var(--c-body)); }
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
