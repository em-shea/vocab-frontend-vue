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
  star: { cn: '天勇星', pinyin: 'tiān yǒng xīng', en: 'the Brave Star' },
  weapon: { cn: '青龙偃月刀', pinyin: 'qīng lóng yǎn yuè dāo', en: 'Green Dragon Crescent Blade' },
  background: { cn: '蒲东巡检', pinyin: 'Pú dōng xún jiǎn', en: 'Patrol officer of Pudong' },
  quote: {
    cn: '幼读兵书，深通武艺，有万夫不当之勇。',
    pinyin: 'yòu dú bīng shū shēn tōng wǔ yì yǒu wàn fū bù dāng zhī yǒng',
    en: 'He read books on war as a boy, mastered the martial arts, and has the courage to stand against ten thousand men.',
    sourceCn: '宣赞荐关胜',
    sourceEn: 'Xuan Zan, recommending him to the court'
  },
  story: {
    en: 'Said to descend from the great general Guan Yu, he was sent to crush Liangshan. Huyan Zhuo pretended to defect and lured him into a night raid, where he was captured. Song Jiang\'s respect won him over, and he became first of the Five Tiger Generals.',
    cn: '关胜相传是关羽后代，奉命征讨梁山。呼延灼诈降，诱他夜袭劫寨，将他擒获。宋江以礼相待，关胜归顺梁山，位列马军五虎将之首。'
  },
  // The print is a stand-in: its subject is not recorded, so the credit does not name a hero.
  printCredit: {
    en: 'Utagawa Kuniyoshi, One Hundred and Eight Heroes of the Popular Water Margin, c. 1827–1830. Public domain.',
    cn: '歌川国芳，《通俗水浒传豪杰百八人之一个》，约 1827–1830 年。公有领域。'
  },
  print: printCollect,
  sprite: guanSheet,
  frames: 5,
  // The glaive sticks out to the right: the body is centred on column 29, and
  // the top 21 rows of the frame are empty.
  bodyX: 29,
  headroom: 21,
  // The feet stand on row 58: the bottom five rows of the frame are empty.
  feetRow: 58,
  silhouette: guanSilhouette
}

// LAYOUT TEST ONLY, not a real hero: a fake pairing of the longest nickname
// (神行太保, four characters) with the longest name (公孙胜, three) to prove the
// name line stays on one line in every layout. Reuses Guan Sheng's art and facts (background included).
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
  star: { cn: '地慧星', pinyin: 'dì huì xīng', en: 'the Wise Star' },
  weapon: { cn: '日月双刀', pinyin: 'rì yuè shuāng dāo', en: 'twin sabres' },
  background: { cn: '扈家庄庄主之女', pinyin: 'Hù jiā zhuāng zhuāng zhǔ zhī nǚ', en: 'Daughter of the lord of Hu Family Manor' },
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
      <h3 class="lab__sub">Immersive (Chinese only, no pinyin, no English)</h3>
      <div class="option__row">
        <figure class="slot" data-lab-id="B-front-imm">
          <HeroCard :hero="guan" variant="full-art" reading="immersive" />
          <figcaption>Front, immersive</figcaption>
        </figure>
        <figure class="slot" data-lab-id="B-back-imm">
          <HeroCard :hero="guan" variant="full-art" face="back" reading="immersive" />
          <figcaption>Back, immersive</figcaption>
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
      <h3 class="lab__sub">Immersive</h3>
      <div class="option__row">
        <figure class="slot" data-lab-id="A-front-imm">
          <HeroCard :hero="guan" variant="framed" reading="immersive" />
          <figcaption>Revealed, immersive</figcaption>
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
      <h3 class="lab__sub">Immersive</h3>
      <div class="option__row">
        <figure class="slot" data-lab-id="C-front-imm">
          <HeroCard :hero="guan" variant="compact" reading="immersive" />
          <figcaption>Revealed, immersive</figcaption>
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
