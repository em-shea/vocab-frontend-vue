<script setup>
import { computed } from 'vue'

// One line of card text in Chinese, optionally with per-character pinyin set as
// ruby above it and an English line beneath. Used by HeroCard for the fact
// values (star, weapon, background) and the quote.
//
// `pinyin` is space-separated syllables, one per Chinese character (punctuation
// and spaces take none). If the counts do not match the line is shown without
// ruby (and a warning is logged in development).
//
// Ruby is read awkwardly by screen readers, so the ruby block is aria-hidden
// and the plain Chinese sits next to it in visually hidden text. The English
// line stays visible and readable.
const props = defineProps({
  cn: { type: String, required: true },
  pinyin: { type: String, default: '' },
  en: { type: String, default: '' },
  ruby: { type: Boolean, default: false }
})

const SKIP = /[\p{P}\p{S}\s]/u
const pairs = computed(() => {
  if (!props.ruby || !props.pinyin) return null
  const chars = [...props.cn]
  const syl = props.pinyin.trim().split(/\s+/)
  const need = chars.filter((c) => !SKIP.test(c)).length
  if (need !== syl.length) {
    if (import.meta.env.DEV) console.warn(`HeroLine: ${need} characters but ${syl.length} syllables for "${props.cn}" / "${props.pinyin}"`)
    return null
  }
  let i = 0
  const cells = chars.map((ch) => (SKIP.test(ch) ? { ch, py: null } : { ch, py: syl[i++] }))
  // Group into clauses that end at punctuation, so a line never breaks inside one.
  const clauses = [[]]
  cells.forEach((c, j) => {
    clauses[clauses.length - 1].push(c)
    if (!c.py && j < cells.length - 1) clauses.push([])
  })
  return clauses
})

</script>

<template>
  <span class="hl">
    <template v-if="pairs">
      <span class="sr-only" lang="zh-Hans">{{ cn }}</span>
      <span class="hl__zh hl__zh--ruby" lang="zh-Hans" aria-hidden="true"><span v-for="(cl, k) in pairs" :key="k" class="hl__clause"><template v-for="(p, i) in cl" :key="i"><ruby v-if="p.py">{{ p.ch }}<rt lang="zh-Latn-pinyin">{{ p.py }}</rt></ruby><span v-else class="hl__punct">{{ p.ch }}</span></template></span></span>
    </template>
    <span v-else class="hl__zh" lang="zh-Hans">{{ cn }}</span>
    <span v-if="en" class="hl__en" lang="en">{{ en }}</span>
  </span>
</template>

<style scoped>
.hl { display: flex; flex-direction: column; min-width: 0; }
.hl__zh { font-family: var(--f-hanzi); }
.hl__zh--ruby { display: flex; flex-wrap: wrap; align-items: flex-end; row-gap: 0.25em; line-height: var(--hl-zh-lh, 1.35); }
/* A clause moves to the next line whole; only a clause longer than the line breaks inside. */
.hl__clause { display: inline-flex; flex-wrap: wrap; align-items: flex-end; row-gap: 0.25em; min-width: 0; max-width: 100%; white-space: nowrap; }
/* Each character is a cell, pinyin on top and character below, as wide as the
 * wider of the two, with a small gap so neighbouring syllables never touch. */
.hl__zh--ruby ruby {
  display: inline-flex;
  flex-direction: column-reverse;
  align-items: center;
  min-width: 1.05em;
  padding-inline: 1.5px;
  line-height: 1.2;
}
.hl__punct { line-height: 1.2; }
.hl__zh--ruby rt {
  font-family: var(--f-ui);
  font-size: max(0.55em, 9px);
  font-weight: var(--w-body);
  line-height: 1;
  letter-spacing: 0;
  display: block;
  white-space: nowrap;
  text-align: center;
  color: var(--c-muted);
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
