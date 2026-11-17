<script setup>
import HeroCard from '../components/HeroCard.vue'
import printCollect from '../assets/prints/hero-collect.jpg'
import guanSheet from '../assets/sprites/guan-sheng-idle.png'
import guanSilhouette from '../assets/sprites/guan-sheng-silhouette.png'
import wuSheet from '../assets/sprites/wu-song.png'

// Internal preview: the three hero card layouts side by side so one can be
// chosen. Headings and labels here are hard-coded English; the card's own
// text comes from the hero object and the i18n keys.

// Guan Sheng: the sprite is the first real AI-generated one (five frames). The
// print is a stand-in; which hero it shows is not recorded.
const guan = {
  rank: 5,
  tier: '天罡',
  name: '关胜',
  pinyin: 'Guān Shèng',
  nameEn: 'Guan Sheng',
  nickname: '大刀',
  nicknameEn: 'Great Blade',
  star: '天勇星',
  starEn: 'the Brave Star',
  weapon: '青龙偃月刀',
  weaponEn: 'Green Dragon Crescent Blade',
  quote: {
    cn: '幼读兵书，深通武艺，有万夫不当之勇。',
    en: 'He read books on war as a boy, mastered the martial arts, and has the courage to stand against ten thousand men.',
    sourceCn: '宣赞荐关胜',
    sourceEn: 'Xuan Zan, recommending him to the court'
  },
  print: printCollect,
  sprite: guanSheet,
  frames: 5,
  silhouette: guanSilhouette
}

// Stand-in: Hu Sanniang has no art yet, so she borrows the same print and the
// Wu Song placeholder sprite (four frames). Neither is her likeness. No quote.
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
  print: printCollect,
  sprite: wuSheet,
  frames: 4,
  silhouette: guanSilhouette
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
      Three layouts for the collectible card. The Guan Sheng sprite is real; the print and Hu Sanniang's sprite are placeholders.
      Vermilion marks the 36 Heavenly Spirits, navy the 72 Earthly Fiends.
    </p>

    <section v-for="o in options" :key="o.id" class="option" :data-option="o.id">
      <h2>{{ o.title }}</h2>
      <div class="option__row">
        <figure class="slot">
          <HeroCard :hero="guan" :variant="o.variant" state="revealed" />
          <figcaption>Revealed, Heavenly Spirit</figcaption>
        </figure>
        <figure class="slot">
          <HeroCard :hero="guan" :variant="o.variant" state="locked" />
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
