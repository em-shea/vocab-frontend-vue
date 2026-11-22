<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'

// After the daily email: the reader picks simplified or traditional, and
// immersion mode (中文) puts the whole site, definitions included, in Chinese
// (Emily, 2026-11-22). The mock shows one word both ways. Decorative: the
// text says it all.
const { t } = useI18n()
</script>

<template>
  <section class="split">
    <div class="split__text">
      <SectionHead :title="t('readHeadline')" />
      <p>{{ t('readBody') }}</p>
    </div>

    <div class="pair" aria-hidden="true">
      <div class="pair__card">
        <p class="label pair__mode">简 · EN</p>
        <p class="hanzi pair__word" lang="zh-Hans">爱护</p>
        <p class="pinyin pair__pinyin">ài hù</p>
        <p class="pair__meaning">to cherish; to take care of</p>
      </div>
      <div class="pair__card">
        <p class="label pair__mode">繁 · 中文</p>
        <p class="hanzi pair__word" lang="zh-Hant">愛護</p>
        <p class="pinyin pair__pinyin">ài hù</p>
        <p class="pair__meaning" lang="zh-Hant">關心並保護；珍惜</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.split { display: grid; gap: var(--s-8); align-items: start; }
.split__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }

.pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-4); }
.pair__card {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-4) var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  min-width: 0;
}
.pair__mode { margin: 0 0 var(--s-2); padding-bottom: var(--s-2); border-bottom: var(--bw-hair) solid var(--c-rule); }
.pair__word { font-size: var(--t-2xl); color: var(--c-ink); line-height: 1.1; }
.pair__pinyin { color: var(--c-body); }
.pair__meaning { color: var(--c-ink); font-size: var(--t-base); }

@media (min-width: 720px) {
  .split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s-12); align-items: center; }
  /* Cards on the left, so the pictures alternate sides down the page. */
  .pair { order: -1; }
}
</style>
