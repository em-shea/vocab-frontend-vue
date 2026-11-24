<script setup>
import { useI18n } from 'vue-i18n'

// The foot of every page: quiet, small text under a hairline. It says the site
// uses AI and where to report mistakes, and credits the woodblock prints (once,
// so the prints carry no captions) and the fonts.
const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <p class="site-footer__ai">
      {{ t('footerAi') }}
      <a href="mailto:nihao@haohaotiantian.com">nihao@haohaotiantian.com</a>
    </p>
    <p class="site-footer__credit">{{ t('footerPrints') }}</p>
    <!-- The fonts are SIL OFL, which asks for no credit on the page; the tier
         icons are CC BY 3.0, which does (Emily, 2026-11-23). -->
    <p class="site-footer__credit">
      {{ t('footerIcons') }}
      <a href="https://game-icons.net" rel="noopener">game-icons.net</a>,
      <a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener">CC BY 3.0</a>
    </p>
    <p class="site-footer__credit">
      {{ t('footerStrokes') }}
      <a href="https://github.com/chanind/hanzi-writer-data/blob/master/ARPHICPL.TXT" rel="noopener">Arphic Public License</a>
    </p>
  </footer>
</template>

<style scoped>
.site-footer { display: flex; flex-direction: column; gap: var(--s-2); padding-top: var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.site-footer__ai { font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-body); overflow-wrap: anywhere; }
.site-footer__credit { font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-muted); overflow-wrap: anywhere; }
</style>
