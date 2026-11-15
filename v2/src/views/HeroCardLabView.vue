<script setup>
import HeroCard from '../components/HeroCard.vue'
import printCollect from '../assets/prints/hero-collect.jpg'
import luSheet from '../assets/sprites/lu-zhishen.png'
import luSilhouette from '../assets/sprites/lu-zhishen-silhouette.png'
import wuSheet from '../assets/sprites/wu-song.png'

// Internal preview: the three hero card layouts side by side so one can be
// chosen. Headings and labels here are hard-coded English; the card's own
// text comes from the hero object and the i18n keys.

const lu = {
  rank: 13,
  tier: '天罡',
  name: '鲁智深',
  pinyin: 'Lǔ Zhìshēn',
  nameEn: 'Lu Zhishen',
  nickname: '花和尚',
  nicknameEn: 'the Flowery Monk',
  star: '天孤星',
  starEn: 'the Solitary Star',
  weapon: '禅杖',
  weaponEn: "monk's staff",
  lineEn: 'A monk who drinks, brawls and cannot stand to see the weak bullied.',
  lineCn: '一个喝酒打架、见不得弱者受欺负的和尚。',
  print: printCollect,
  sprite: luSheet,
  silhouette: luSilhouette
}

// Stand-ins: Hu Sanniang has no art yet, so she borrows the same print and the
// Wu Song placeholder sprite. Both are placeholders, not her likeness.
const hu = {
  rank: 59,
  tier: '地煞',
  name: '扈三娘',
  pinyin: 'Hù Sānniáng',
  nameEn: 'Hu Sanniang',
  nickname: '一丈青',
  nicknameEn: 'Ten Feet of Blue',
  star: '地慧星',
  starEn: 'the Wise Star',
  weapon: '日月双刀',
  weaponEn: 'twin sabres',
  lineEn: 'A swordswoman who captures her opponents with a red silk lasso.',
  lineCn: '用红锦套索生擒对手的女将。',
  print: printCollect,
  sprite: wuSheet,
  silhouette: luSilhouette
}

const options = [
  { id: 'a', title: 'Option A: framed', variant: 'framed', extra: true },
  { id: 'b', title: 'Option B: full art', variant: 'full-art', extra: false },
  { id: 'c', title: 'Option C: compact', variant: 'compact', extra: true }
]
</script>

<template>
  <main class="lab">
    <h1>Hero card</h1>
    <p class="lab__note">
      Three layouts for the collectible card. The sprite and print are placeholders.
      Vermilion marks the 36 Heavenly Spirits, navy the 72 Earthly Fiends.
    </p>

    <section v-for="o in options" :key="o.id" class="option" :data-option="o.id">
      <h2>{{ o.title }}</h2>
      <div class="option__row">
        <figure class="slot">
          <HeroCard :hero="lu" :variant="o.variant" state="revealed" />
          <figcaption>Revealed, Heavenly Spirit</figcaption>
        </figure>
        <figure class="slot">
          <HeroCard :hero="lu" :variant="o.variant" state="locked" />
          <figcaption>Locked</figcaption>
        </figure>
        <figure v-if="o.extra" class="slot">
          <HeroCard :hero="hu" :variant="o.variant" state="revealed" />
          <figcaption>Revealed, Earthly Fiend</figcaption>
        </figure>
      </div>
    </section>
  </main>
</template>

<style scoped>
.lab {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--s-8) var(--s-4) var(--s-16);
}
.lab__note { color: var(--c-body); }
.option { display: flex; flex-direction: column; gap: var(--s-4); }
.option__row { display: flex; flex-wrap: wrap; gap: var(--s-8); align-items: flex-start; }
.slot { display: flex; flex-direction: column; gap: var(--s-3); margin: 0; width: 100%; max-width: 420px; min-width: 0; }
.slot figcaption { font-size: var(--t-sm); color: var(--c-muted); }
[data-option='a'] .slot, [data-option='b'] .slot { max-width: 320px; }
</style>
