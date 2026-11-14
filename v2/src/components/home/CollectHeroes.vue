<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import PrintFrame from '../PrintFrame.vue'
import printCollect from '../../assets/prints/hero-collect.jpg'

// The hero system: how heroes arrive, who the 108 are, and one example card.
// The card shows the whole print as its picture. The print is a stand-in, so
// its subject is not named; the card names the example hero in text.
const { t } = useI18n()
</script>

<template>
  <section class="split">
    <div class="split__text">
      <SectionHead :title="t('collectHeadline')" />
      <p>{{ t('collectBody') }}</p>
      <p>{{ t('storyBody') }}</p>
    </div>

    <div class="hero">
      <div class="hero__plate">
        <p class="brush hero__name">{{ t('heroName') }}</p>
        <p class="pinyin hero__pinyin">{{ t('heroPinyin') }}</p>
        <p class="hero__nick">
          <span class="brush">{{ t('heroNickname') }}</span>
          <span>{{ t('heroNicknameGloss') }}</span>
        </p>
      </div>
      <PrintFrame ratio="480 / 705" :src="printCollect" alt="" :caption="t('printCredit')" />
    </div>
  </section>
</template>

<style scoped>
.split { display: grid; gap: var(--s-8); align-items: start; }
.split__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }

.hero { display: flex; flex-direction: column; gap: var(--s-3); max-width: 420px; width: 100%; justify-self: center; min-width: 0; }
.hero__plate {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-4);
  background-color: var(--c-panel);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.hero__name { font-size: var(--t-xl); line-height: var(--lh-tight); color: var(--c-ink); }
.hero__pinyin { font-size: var(--t-base); }
.hero__nick { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2); color: var(--c-body); font-size: var(--t-base); }
.hero__nick .brush { font-size: var(--t-lg); color: var(--c-seal); }

@media (min-width: 720px) {
  .split { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); }
  .hero { order: -1; }
}
</style>
