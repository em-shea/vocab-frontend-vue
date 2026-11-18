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
  story: {
    en: 'A border patrol officer said to descend from the great general Guan Yu, he was sent to crush the Liangshan outlaws. Song Jiang lured him into a night raid and captured him, then treated him with such respect that he changed sides. He became the first of the Five Tiger Generals of the Liangshan cavalry.',
    cn: '关胜相传是关羽的后代，原是一名巡检，奉命征讨梁山。宋江设计诱他夜袭劫寨，将他擒获，又以礼相待，关胜感其诚意，归顺梁山，后来位列马军五虎将之首。'
  },
  // The print is a stand-in: its subject is not recorded, so the credit does not name a hero.
  printCredit: {
    en: 'Utagawa Kuniyoshi, One Hundred and Eight Heroes of the Popular Water Margin, c. 1827–1830. Public domain.',
    cn: '歌川国芳，《通俗水浒传豪杰百八人之一个》，约 1827–1830 年。公有领域。'
  },
  print: printCollect,
  sprite: guanSheet,
  frames: 5,
  silhouette: guanSilhouette
}

// LAYOUT TEST ONLY, not a real hero: a fake pairing of the longest nickname
// (神行太保, four characters) with the longest name (公孙胜, three) to prove the
// name line stays on one line in every layout. Reuses Guan Sheng's art and facts.
const stress = {
  ...guan,
  rank: 6,
  name: '公孙胜',
  pinyin: 'Gōngsūn Shèng',
  nameEn: 'Gongsun Sheng',
  nickname: '神行太保',
  nicknameEn: 'Divine Traveller',
  story: undefined,
  printCredit: undefined
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

</script>

<template>
  <main class="lab">
    <h1>Hero card</h1>
    <p class="lab__note">
      Three layouts for the collectible card. The Guan Sheng sprite is real; the print and Hu Sanniang's sprite are placeholders.
      Vermilion marks the 36 Heavenly Spirits, navy the 72 Earthly Fiends.
    </p>

    <section class="option" data-option="b">
      <h2>Option B: full art</h2>
      <div class="option__row">
        <figure class="slot" data-lab-id="B-flip">
          <HeroCard :hero="guan" variant="full-art" flippable />
          <figcaption>Interactive: flip it over</figcaption>
        </figure>
      </div>
      <div class="option__row">
        <figure class="slot" data-lab-id="B-front">
          <HeroCard :hero="guan" variant="full-art" />
          <figcaption>Front, revealed</figcaption>
        </figure>
        <figure class="slot" data-lab-id="B-back">
          <HeroCard :hero="guan" variant="full-art" face="back" />
          <figcaption>Back</figcaption>
        </figure>
        <figure class="slot" data-lab-id="B-locked">
          <HeroCard :hero="guan" variant="full-art" state="locked" />
          <figcaption>Front, locked</figcaption>
        </figure>
      </div>
      <h3 class="lab__sub">Layout test: longest nickname and name (fake hero)</h3>
      <div class="option__row">
        <figure class="slot" data-lab-id="B-stress">
          <HeroCard :hero="stress" variant="full-art" />
          <figcaption>神行太保 公孙胜, a layout test, not a real hero</figcaption>
        </figure>
      </div>
    </section>

    <section class="option" data-option="a">
      <h2>Option A: framed</h2>
      <div class="option__row">
        <figure class="slot" data-lab-id="A-front">
          <HeroCard :hero="guan" variant="framed" />
          <figcaption>Revealed, Heavenly Spirit</figcaption>
        </figure>
        <figure class="slot" data-lab-id="A-locked">
          <HeroCard :hero="guan" variant="framed" state="locked" />
          <figcaption>Locked</figcaption>
        </figure>
        <figure class="slot" data-lab-id="A-earthly">
          <HeroCard :hero="hu" variant="framed" />
          <figcaption>Revealed, Earthly Fiend</figcaption>
        </figure>
      </div>
      <h3 class="lab__sub">Layout test: longest nickname and name (fake hero)</h3>
      <div class="option__row">
        <figure class="slot" data-lab-id="A-stress">
          <HeroCard :hero="stress" variant="framed" />
          <figcaption>Layout test, not a real hero</figcaption>
        </figure>
      </div>
    </section>

    <section class="option" data-option="c">
      <h2>Option C: compact</h2>
      <div class="option__row">
        <figure class="slot" data-lab-id="C-front">
          <HeroCard :hero="guan" variant="compact" />
          <figcaption>Revealed, Heavenly Spirit</figcaption>
        </figure>
        <figure class="slot" data-lab-id="C-locked">
          <HeroCard :hero="guan" variant="compact" state="locked" />
          <figcaption>Locked</figcaption>
        </figure>
        <figure class="slot" data-lab-id="C-earthly">
          <HeroCard :hero="hu" variant="compact" />
          <figcaption>Revealed, Earthly Fiend</figcaption>
        </figure>
      </div>
      <h3 class="lab__sub">Layout test: longest nickname and name (fake hero)</h3>
      <div class="option__row">
        <figure class="slot" data-lab-id="C-stress">
          <HeroCard :hero="stress" variant="compact" />
          <figcaption>Layout test, not a real hero</figcaption>
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
.lab__sub { font-size: var(--t-lg); }
.slot figcaption { font-size: var(--t-sm); color: var(--c-muted); }
[data-option='a'] .slot, [data-option='b'] .slot { max-width: 320px; }
</style>
