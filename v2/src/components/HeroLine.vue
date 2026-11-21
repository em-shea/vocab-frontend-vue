<script setup>
import { computed, inject, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

// One line of card text in Chinese, with an English line beside or beneath it.
// Used by HeroCard for the fact values (star, weapon, background) and the quote.
//
// `pinyin` marks the words: " / " between words, single spaces between the
// syllables inside a word, ONE SYLLABLE PER CHINESE CHARACTER (punctuation takes
// none): "yòu / dú / bīng shū / shēn tōng". A string with no " / " is treated as
// one word per syllable. If the counts do not match the characters, the line is
// shown as plain text with no pinyin (and a warning is logged in development).
//
// Pinyin is on demand, by WORD. With `ruby` set (guided mode) every word of the
// Chinese is its own button that looks like text (inherits the font, no gap
// between words, punctuation is plain text between them). Hovering a word
// (pointer devices) shows a small navy pop-up just above it, left-aligned with
// the word, holding that word's pinyin written the standard way: its syllables
// joined (bīngshū, Púdōng; proper nouns are capitalised in the data). Clicking,
// tapping or pressing Enter/Space pins it open (aria-pressed), and again hides
// it. The pop-up is absolutely positioned, so it never moves anything; if it
// would leave the card face it is nudged left. A dotted underline marks a word
// with pinyin behind it; it turns solid vermilion while the pop-up is shown.
//
// HeroCard provides `heroPinyin` ({ openId }) so that only one pop-up is pinned
// per card; without it (used alone) the line keeps its own state.
//
// The plain Chinese sits in visually hidden text for screen readers; each button
// is named "Pinyin for <word>" and points at its pop-up with aria-describedby
// while it is shown. The English stays visible and readable. CSS variables:
// --hl-dir (column, or row to put the English beside the Chinese and wrap
// beneath it only when it must), --hl-en-size, --hl-en-color.
const props = defineProps({
  cn: { type: String, required: true },
  pinyin: { type: String, default: '' },
  en: { type: String, default: '' },
  ruby: { type: Boolean, default: false }
})

const { t } = useI18n()
const uid = `hl-${useId()}`
const ctx = inject('heroPinyin', null)
const local = ref(null)
const openId = computed(() => (ctx ? ctx.openId.value : local.value))
const toggle = (id) => {
  const next = openId.value === id ? null : id
  if (ctx) ctx.openId.value = next
  else local.value = next
}

const SKIP = /[\p{P}\p{S}\s]/u
// The line as segments: plain text (punctuation) and words { text, tip }. Null
// when the pinyin does not match the Chinese, one syllable per character.
const segments = computed(() => {
  if (!props.ruby || !props.pinyin) return null
  const raw = props.pinyin.trim()
  const words = raw.includes('/')
    ? raw.split('/').map((w) => w.trim().split(/\s+/).filter(Boolean)).filter((w) => w.length)
    : raw.split(/\s+/).filter(Boolean).map((s) => [s])
  const chars = [...props.cn]
  const need = chars.filter((c) => !SKIP.test(c)).length
  const have = words.reduce((n, w) => n + w.length, 0)
  if (need !== have) {
    if (import.meta.env.DEV) console.warn(`HeroLine: ${need} characters but ${have} syllables for "${props.cn}" / "${props.pinyin}"`)
    return null
  }
  const out = []
  let i = 0
  for (const w of words) {
    let plain = ''
    while (i < chars.length && SKIP.test(chars[i])) plain += chars[i++]
    if (plain) out.push({ text: plain })
    let text = ''
    let n = 0
    while (n < w.length) {
      if (!SKIP.test(chars[i])) n++
      text += chars[i++]
    }
    out.push({ text, tip: w.join(''), id: `${uid}-${out.length}` })
  }
  if (i < chars.length) out.push({ text: chars.slice(i).join('') })
  return out
})

// Keep a pop-up inside the card face: nudge it left by however far it would
// stick out on the right (and right if it would stick out on the left).
const place = (e) => {
  const w = e.currentTarget
  const tip = w.querySelector('.hl__tip')
  const face = w.closest('.face')
  if (!tip || !face) return
  tip.style.removeProperty('--tip-x')
  const f = face.getBoundingClientRect()
  const bw = parseFloat(getComputedStyle(face).borderLeftWidth) || 0
  const r = tip.getBoundingClientRect()
  const over = r.right - (f.right - bw - 2)
  const under = f.left + bw + 2 - r.left
  const dx = over > 0 ? -over : under > 0 ? under : 0
  if (dx) tip.style.setProperty('--tip-x', `${dx}px`)
}
const onClick = (e, id) => {
  place({ currentTarget: e.currentTarget.parentElement })
  toggle(id)
}
</script>

<template>
  <span class="hl">
    <template v-if="segments">
      <span class="sr-only" lang="zh-Hans">{{ cn }}</span>
      <span class="hl__zh" lang="zh-Hans"><template v-for="(s, i) in segments" :key="i"><span v-if="s.tip" class="hl__w" :class="{ 'hl__w--open': openId === s.id }" @pointerenter="place" @focusin="place"><button
        type="button"
        class="hl__btn"
        :aria-pressed="openId === s.id ? 'true' : 'false'"
        :aria-label="t('heroCardWordPinyin', { text: s.text })"
        :aria-describedby="openId === s.id ? s.id : null"
        @click="onClick($event, s.id)"
      ><span class="hl__wz" aria-hidden="true">{{ s.text }}</span></button><span :id="s.id" class="hl__tip" lang="zh-Latn-pinyin" aria-hidden="true">{{ s.tip }}</span></span><span v-else aria-hidden="true">{{ s.text }}</span></template></span>
    </template>
    <span v-else class="hl__zh" lang="zh-Hans">{{ cn }}</span>
    <span v-if="en" class="hl__en" lang="en">{{ en }}</span>
  </span>
</template>

<style scoped>
.hl { display: flex; flex-direction: var(--hl-dir, column); flex-wrap: wrap; align-items: baseline; gap: 0 var(--hl-gap, var(--s-2)); min-width: 0; }
.hl__zh { font-family: var(--f-hanzi); line-height: var(--hl-zh-lh, 1.4); }
/* One word: inline, no margin, so the characters keep their natural spacing. */
.hl__w { position: relative; display: inline-block; white-space: nowrap; }
/* The word as a button that looks like text. */
.hl__btn {
  display: inline;
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
.hl__wz {
  text-decoration: underline dotted;
  text-decoration-color: var(--c-muted);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.22em;
}
.hl__w--open .hl__wz {
  text-decoration-style: solid;
  text-decoration-color: var(--c-seal);
}
/* The pop-up: absolutely positioned above its word, left-aligned (nudged by
 * --tip-x if it would leave the face), never in the flow. */
.hl__tip {
  position: absolute;
  left: var(--tip-x, 0);
  bottom: 100%;
  z-index: 20;
  margin-bottom: 4px;
  width: max-content;
  padding: 3px 6px;
  font-family: var(--f-ui);
  font-size: var(--t-xs);
  line-height: 1.3;
  letter-spacing: 0;
  white-space: nowrap;
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
  left: calc(8px - var(--tip-x, 0px));
  border: 4px solid transparent;
  border-top-color: var(--c-ink);
  border-bottom-width: 0;
}
.hl__w--open .hl__tip { visibility: visible; }
@media (hover: hover) {
  .hl__w:hover .hl__tip { visibility: visible; }
  .hl__w:hover .hl__wz { text-decoration-style: solid; text-decoration-color: var(--c-seal); }
}
.hl__en { font-family: var(--f-ui); font-size: var(--hl-en-size, var(--t-sm)); line-height: var(--lh-snug); color: var(--hl-en-color, var(--c-body)); min-width: 0; }
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
