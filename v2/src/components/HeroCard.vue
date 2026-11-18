<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// The collectible hero card. One component, three layouts:
//
//   framed    a bordered card: header strip, framed art window, a small quote
//             panel and a footer (trading-card portrait, 63:88, up to 320px
//             wide; sprite at 3x)
//   full-art  the print fills the card; text sits on solid plates laid over it
//             (63:88, up to 320px wide; sprite at 4x, 256px frames)
//   compact   a landscape card for lists and phones (about 420 x 180; sprite 2x)
//
// The card shows no stats, power numbers or abilities: the game rules are not
// defined, and nothing here may imply that one hero is stronger than another.
// The rank is where a hero stands in the novel's own list of 108.
//
// `hero` fields: rank, tier ('天罡' | '地煞'), name, pinyin, nameEn, nickname,
// nicknameEn, star, starEn, weapon, weaponEn, an optional quote
// ({ cn, en, sourceCn, sourceEn }; a hero without one simply shows no quote),
// an optional story ({ en, cn }) and printCredit ({ en, cn }) for the back of
// the card, and the image imports print, sprite (a strip of `frames` 64px
// frames, so 64*frames wide and 64 high; `frames` defaults to 4) and
// silhouette (one 64px frame).
//
// Two optional sprite-placement fields, because the art is rarely centred in
// its 64x64 frame: `bodyX`, the column (0 to 63) the body is centred on, not
// counting a weapon that sticks out to one side (default 32, the middle); and
// `headroom`, the number of empty rows at the top of the frame (default 0).
// The sprite is shifted by (32 - bodyX) whole sprite pixels so the body sits on
// the card's centre line and its plinth, and pulled up by `headroom` rows so the
// empty rows cost no card height (they pass behind the name plate).
//
// Name line, every layout: the nickname (绰号, the epithet) and the name read as
// ONE title in the novel's own word order, 大刀关胜: same size, same ink colour,
// same brush font, a small gap between, on ONE line that never wraps. One shared
// size per layout (--name-size) is chosen so the worst case, a four-character
// nickname with a three-character name, fits next to the rank seal. In English
// the line under it names the nickname plainly: Guān Shèng, “Great Blade”.
// Chinese shows pinyin only.
//
// Front faces carry the quote and nothing else: star and weapon are on the back
// (compact keeps its small star and weapon line).
//
// `state`: 'revealed' shows everything; 'locked' swaps the sprite for the
// silhouette, fades the print, and leaves out the name, nickname, star, weapon
// and quote. The rank and tier stay: they say where the empty slot is.
//
// `face`: 'front' (default) or 'back'. The back shows the print at full
// strength, then a solid plate with the name line, star and weapon, the story
// and the print's credit. A locked card has no back: `face` and `flippable` are ignored.
//
// `flippable`: renders both faces and a real button that turns the card over
// (3D rotateY, or a plain swap under prefers-reduced-motion). The hidden face
// is `inert` and `aria-hidden`, so it is neither focusable nor read out. A hero
// with no story has no back and is not flippable.
//
// The two tiers are told apart by colour alone as well as by text: vermilion
// seal and frame for the 36 Heavenly Spirits, navy for the 72 Earthly Fiends.
const props = defineProps({
  hero: { type: Object, required: true },
  variant: { type: String, default: 'framed', validator: (v) => ['framed', 'full-art', 'compact'].includes(v) },
  state: { type: String, default: 'revealed', validator: (v) => ['revealed', 'locked'].includes(v) },
  face: { type: String, default: 'front', validator: (v) => ['front', 'back'].includes(v) },
  flippable: { type: Boolean, default: false }
})

const { t, locale } = useI18n()

const locked = computed(() => props.state === 'locked')
const chinese = computed(() => locale.value === 'cn')
const heavenly = computed(() => props.hero.tier === '天罡')
const tierGloss = computed(() => t(heavenly.value ? 'heroCardTierHeavenly' : 'heroCardTierEarthly'))
const rankText = computed(() => t('heroCardRank', { n: props.hero.rank }))
// Full art has no visible footer, so its screen-reader text carries the tier too.
const rankTierText = computed(() => t('heroCardRankTier', { n: props.hero.rank, tier: tierGloss.value }))
const quote = computed(() => props.hero.quote || null)
const quoteSource = computed(() => (quote.value ? (chinese.value ? quote.value.sourceCn : quote.value.sourceEn) : ''))
// Second line under the name: in English the pinyin then the nickname in curly
// quotes (Guān Shèng, “Great Blade”); pinyin only in Chinese.
const subline = computed(() => (chinese.value ? props.hero.pinyin : `${props.hero.pinyin}, \u201C${props.hero.nicknameEn}\u201D`))
const artLabel = computed(() =>
  locked.value
    ? t('heroCardArtLocked')
    : t('heroCardArt', { name: chinese.value ? props.hero.name : props.hero.nameEn }))

const story = computed(() => (props.hero.story ? (chinese.value ? props.hero.story.cn : props.hero.story.en) : ''))
const printCredit = computed(() => (props.hero.printCredit ? (chinese.value ? props.hero.printCredit.cn : props.hero.printCredit.en) : ''))

// Flipping. Locked cards and heroes without a story have no back.
const hasBack = computed(() => !locked.value && Boolean(story.value))
const canFlip = computed(() => props.flippable && hasBack.value)
const showBack = ref(props.face === 'back')
watch(() => props.face, (f) => { showBack.value = f === 'back' })
const backUp = computed(() => hasBack.value && showBack.value)
// Static back: only the back is rendered. Flippable: both, one hidden.
const renderFront = computed(() => canFlip.value || !backUp.value)
const renderBack = computed(() => canFlip.value || backUp.value)
const frontHidden = computed(() => canFlip.value && backUp.value)
const backHidden = computed(() => canFlip.value && !backUp.value)
const flip = () => { showBack.value = !showBack.value }
const sideText = computed(() => t(backUp.value ? 'heroCardShowingBack' : 'heroCardShowingFront'))

// Whole-number sprite scale, so the pixel art stays crisp: 4x (256px frames) in
// full art, 3x framed, 2x compact.
const scale = computed(() => (props.variant === 'compact' ? 2 : props.variant === 'full-art' ? 4 : 3))
const spriteStyle = computed(() => ({
  '--k': scale.value,
  '--n': props.hero.frames || 4,
  '--bx': props.hero.bodyX ?? 32,
  '--hr': props.hero.headroom ?? 0,
  backgroundImage: `url("${locked.value ? props.hero.silhouette : props.hero.sprite}")`
}))
</script>

<template>
  <article
    class="card"
    :class="[`card--${variant}`, heavenly ? 'card--heavenly' : 'card--earthly', { 'card--locked': locked, 'card--flippable': canFlip }]"
  >
    <div class="flipstage">
      <div class="flip" :class="{ 'flip--3d': canFlip, 'flip--back': canFlip && backUp }">

        <!-- FRONT -->
        <div
          v-if="renderFront"
          class="face face--front"
          :inert="frontHidden"
          :aria-hidden="frontHidden ? 'true' : null"
        >
          <!-- Full art: the print is the card, so the name plate comes first in the
               reading order and the art layer sits behind everything. There is no
               footer: the tier shows by colour and is read out in the hidden text. -->
          <template v-if="variant === 'full-art'">
            <div class="stage" role="img" :aria-label="artLabel">
              <img class="stage__print" :src="hero.print" alt="" />
              <div class="stage__halftone" aria-hidden="true"></div>
            </div>

            <div class="flow">
              <header class="plate plate--name">
                <div class="plate__text">
<div class="namerow">
  <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
  <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
</div>
<p v-if="!locked" class="pinyin">{{ subline }}</p>
                </div>
                <span class="sr-only">{{ rankTierText }}</span>
                <span class="seal" aria-hidden="true">{{ hero.rank }}</span>
              </header>

              <div class="figure">
                <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
              </div>

              <div v-if="locked || quote" class="plate plate--info">
                <template v-if="!locked">
                  <figure v-if="quote" class="quote">
                    <blockquote class="quote__zh hanzi" lang="zh-Hans">{{ quote.cn }}</blockquote>
                    <p v-if="!chinese" class="quote__en" lang="en">{{ quote.en }}</p>
                    <figcaption class="quote__src">{{ quoteSource }}</figcaption>
                  </figure>
                </template>
                <p v-else class="line">{{ t('heroCardLocked') }}</p>
              </div>
            </div>
          </template>

          <!-- Compact: art window on the left, text on the right. -->
          <template v-else-if="variant === 'compact'">
            <div class="window" role="img" :aria-label="artLabel">
              <img class="window__print" :src="hero.print" alt="" />
              <div class="window__halftone" aria-hidden="true"></div>
              <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
            </div>

            <div class="body">
              <header class="head">
                <div class="head__text">
<div class="namerow">
  <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
  <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
</div>
<p v-if="!locked" class="pinyin">{{ subline }}</p>
                </div>
                <span class="seal seal--small" aria-hidden="true">{{ hero.rank }}</span>
              </header>

              <template v-if="!locked">
                <p class="meta">
                  <span class="hanzi">{{ hero.star }}</span>
                  <span aria-hidden="true"> · </span>
                  <span class="hanzi">{{ hero.weapon }}</span>
                  <span v-if="!chinese" class="meta__gloss"> ({{ hero.starEn }}; {{ hero.weaponEn }})</span>
                </p>
                <!-- Chinese only here: the card is short on room. -->
                <figure v-if="quote" class="quote">
                  <blockquote class="quote__zh hanzi" lang="zh-Hans">{{ quote.cn }}</blockquote>
                  <figcaption class="quote__src">{{ quoteSource }}</figcaption>
                </figure>
              </template>
              <p v-else class="line">{{ t('heroCardLocked') }}</p>

              <footer class="foot">
                <span class="sr-only">{{ rankText }}</span>
                <span class="foot__rank mono" aria-hidden="true">{{ hero.rank }} / 108</span>
                <span class="foot__tier"><i class="tick" aria-hidden="true"></i><span class="brush">{{ hero.tier }}</span> {{ tierGloss }}</span>
              </footer>
            </div>
          </template>

          <!-- Framed -->
          <template v-else>
            <header class="head">
              <div class="head__text">
<div class="namerow">
  <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
  <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
</div>
<p v-if="!locked" class="pinyin">{{ subline }}</p>
              </div>
              <span class="seal" aria-hidden="true">{{ hero.rank }}</span>
            </header>

            <div class="window" role="img" :aria-label="artLabel">
              <img class="window__print" :src="hero.print" alt="" />
              <div class="window__halftone" aria-hidden="true"></div>
              <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
            </div>

            <div v-if="locked" class="panel panel--empty">
              <p class="line">{{ t('heroCardLocked') }}</p>
            </div>
            <div v-else-if="quote" class="panel">
              <figure class="quote">
                <blockquote class="quote__zh hanzi" lang="zh-Hans">{{ quote.cn }}</blockquote>
                <p v-if="!chinese" class="quote__en" lang="en">{{ quote.en }}</p>
                <figcaption class="quote__src">{{ quoteSource }}</figcaption>
              </figure>
            </div>

            <footer class="foot">
              <span class="sr-only">{{ rankText }}</span>
              <span class="foot__rank mono" aria-hidden="true">{{ hero.rank }} / 108</span>
              <span class="foot__tier"><i class="tick" aria-hidden="true"></i><span class="brush">{{ hero.tier }}</span> {{ tierGloss }}</span>
            </footer>
          </template>
        </div>

        <!-- BACK: the print at full strength (no sprite, no fade, no halftone),
             then a solid plate with the name line, the story and the credit.
             Never rendered for a locked card. -->
        <div
          v-if="renderBack"
          class="face face--back"
          :inert="backHidden"
          :aria-hidden="backHidden ? 'true' : null"
        >
          <div class="backprint" role="img" :aria-label="t('heroCardPrintArt')">
            <img class="backprint__img" :src="hero.print" alt="" />
          </div>
          <div class="plate plate--back">
            <div class="plate__text">
<div class="namerow">
  <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
  <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
</div>
<p v-if="!locked" class="pinyin">{{ subline }}</p>
            </div>
            <dl class="facts">
              <div>
                <dt>{{ t('heroCardStar') }}</dt>
                <dd><span class="hanzi">{{ hero.star }}</span><span v-if="!chinese">, {{ hero.starEn }}</span></dd>
              </div>
              <div>
                <dt>{{ t('heroCardWeapon') }}</dt>
                <dd><span class="hanzi">{{ hero.weapon }}</span><span v-if="!chinese">, {{ hero.weaponEn }}</span></dd>
              </div>
            </dl>
            <p class="story" :class="{ hanzi: chinese }" :lang="chinese ? 'zh-Hans' : 'en'">{{ story }}</p>
            <p class="credit" :lang="chinese ? 'zh-Hans' : 'en'">{{ printCredit }}</p>
          </div>
        </div>
      </div>
    </div>

    <template v-if="canFlip">
      <button type="button" class="flipbtn" :aria-pressed="backUp ? 'true' : 'false'" @click="flip">{{ t('heroCardFlip') }}</button>
      <span class="sr-only" role="status">{{ sideText }}</span>
    </template>
  </article>
</template>

<style scoped>
/* Tier colour: one variable the frame, seal and tick all read. */
.card {
  --tier: var(--c-red-solid);
  --on-tier: var(--c-on-red);
  /* Name line size, shared by nickname and name. Chosen so four plus three
   * characters fit beside the seal at each layout's width (set per layout). */
  --name-size: var(--t-xl);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  width: 100%;
  min-width: 0;
  color: var(--c-body);
}
.card--earthly {
  --tier: var(--c-ink);
  --on-tier: var(--c-on-button);
}

/* Faces: each one is the card (border, paper, hard shadow). Both sit in the
 * same grid cell so a flippable card keeps one size. */
.flipstage { perspective: 1400px; }
.flip { display: grid; width: 100%; }
.face {
  grid-area: 1 / 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: var(--c-body);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--tier);
  box-shadow: var(--shadow-hard);
}

/* Flip: a 3D turn about the vertical axis. */
.flip--3d { transform-style: preserve-3d; transition: transform 0.5s ease; }
.flip--back { transform: rotateY(180deg); }
.flip--3d .face { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.flip--3d .face--back { transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) {
  /* No rotation: the faces swap with a short fade. */
  .flip--3d, .flip--back { transform: none; transition: none; transform-style: flat; }
  .flip--3d .face--back { transform: none; opacity: 0; visibility: hidden; }
  .flip--3d .face { transition: opacity 0.15s linear; }
  .flip--3d.flip--back .face--back { opacity: 1; visibility: visible; }
  .flip--3d.flip--back .face--front { opacity: 0; visibility: hidden; }
}

.flipbtn {
  align-self: flex-start;
  min-height: 2.75rem;
  padding: 0 var(--s-4);
  font-family: var(--f-ui);
  font-size: var(--t-body);
  font-weight: var(--w-semi);
  color: var(--c-on-button);
  background-color: var(--c-button);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  cursor: pointer;
}
.flipbtn[aria-pressed='true'] { color: var(--c-ink); background-color: var(--c-panel); }

/* Shared pieces ------------------------------------------------------- */
.name { margin: 0; font-size: var(--name-size); line-height: var(--lh-tight); font-weight: var(--w-body); color: var(--c-ink); }
.pinyin { margin: 0; font-size: var(--t-base); line-height: var(--lh-snug); }

.seal {
  flex: none;
  display: grid;
  place-items: center;
  min-width: 2.75rem;
  height: 2.75rem;
  padding: 0 var(--s-1);
  background-color: var(--tier);
  color: var(--on-tier);
  border: var(--bw-hair) solid var(--c-ink-edge);
  box-shadow: 2px 2px 0 var(--c-ink);
  font-family: var(--f-display);
  font-size: var(--t-lead);
  font-weight: var(--w-black);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.seal--small { min-width: 2rem; height: 2rem; font-size: var(--t-body); }

/* Nickname then name, one title (大刀关胜): same size, colour and font, a small
 * gap between, one line, never wraps. */
.namerow { display: flex; flex-wrap: nowrap; align-items: baseline; gap: 0 var(--s-1); white-space: nowrap; min-width: 0; }
.nick__zh { flex: none; font-size: var(--name-size); line-height: var(--lh-tight); color: var(--c-ink); }
.namerow .name { flex: none; }
.pinyin { letter-spacing: 0; }

.quote { display: flex; flex-direction: column; gap: var(--s-1); margin: 0; }
.quote__zh { margin: 0; text-wrap: pretty; font-size: var(--t-body-lg); line-height: var(--lh-body); }
.quote__en { margin: 0; font-size: var(--t-base-sm); line-height: var(--lh-snug); color: var(--c-body); }
.quote__src { font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-muted); }

.facts { display: grid; gap: var(--s-1); margin: 0; }
.facts div { display: grid; grid-template-columns: 3.5rem 1fr; gap: var(--s-2); align-items: baseline; }
.facts dt { font-size: var(--t-sm); color: var(--c-muted); }
.facts dd { margin: 0; font-size: var(--t-base); color: var(--c-ink); }

.line { margin: 0; font-size: var(--t-base); line-height: var(--lh-snug); color: var(--c-body); }
.meta { margin: 0; font-size: var(--t-base-sm); line-height: var(--lh-snug); color: var(--c-ink); }
.meta__gloss { color: var(--c-body); }

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
  font-size: var(--t-sm);
  color: var(--c-ink);
}
.foot__rank { font-weight: var(--w-semi); }
.foot__tier { display: inline-flex; align-items: center; gap: var(--s-1); }
.foot__tier .brush { font-size: var(--t-body); }
.tick { display: inline-block; width: 0.625rem; height: 0.625rem; background-color: var(--tier); border: var(--bw-hair) solid var(--c-ink); }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Sprite: a strip of --n 64px frames (default 4), shown at a whole-number
 * scale --k and stepped across with background-position. 160ms a frame. CSS only. */
.sprite {
  --n: 4;
  --bx: 32;
  --hr: 0;
  flex: none;
  width: calc(64px * var(--k));
  height: calc(64px * var(--k));
  background-repeat: no-repeat;
  background-size: calc(var(--n) * 64px * var(--k)) calc(64px * var(--k));
  background-position: 0 0;
  image-rendering: pixelated;
  animation: idle calc(var(--n) * 0.16s) steps(var(--n)) infinite;
  /* Centre on the body, not body plus weapon (whole sprite pixels, so it stays
   * crisp), and let the empty top rows hang above the box. */
  transform: translateX(calc((32 - var(--bx)) * var(--k) * 1px));
  margin-top: calc(var(--hr) * var(--k) * -1px);
}
.sprite--still {
  background-size: calc(64px * var(--k)) calc(64px * var(--k));
  animation: none;
}
@keyframes idle {
  from { background-position: 0 0; }
  to { background-position: calc(var(--n) * -64px * var(--k)) 0; }
}
@media (prefers-reduced-motion: reduce) {
  .sprite { animation: none; }
}

/* Art windows ----------------------------------------------------------- */
/* The front print is washed back to 40% over the paper so the sprite stands
 * out; locked cards fade it further. */
.window {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  background-color: var(--c-ground);
  border: var(--bw-frame) solid var(--c-ink);
}
.window__print, .stage__print {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
  opacity: 0.4;
}
.window__halftone, .stage__halftone {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(27, 33, 64, 0.12) 0.9px, transparent 1px);
  background-size: 4px 4px;
  mix-blend-mode: multiply;
}
.window .sprite { position: relative; margin-bottom: var(--s-2); }
.window::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: var(--s-2);
  width: 6rem;
  height: 0.375rem;
  transform: translateX(-50%);
  background-color: var(--c-gold);
  border-top: var(--bw-hair) solid var(--c-ink);
  opacity: 0.9;
}
.window .sprite { z-index: 1; }

.card--locked .window__print,
.card--locked .stage__print { opacity: 0.18; filter: saturate(0.4); }
.card--locked .window::after { display: none; }
.card--locked .sprite { opacity: 0.9; }

/* Back ------------------------------------------------------------------ */
.face--back { overflow: hidden; }
.backprint { position: relative; flex: 1; min-height: 6rem; background-color: var(--c-sunk); }
.backprint__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; opacity: 1; }
.plate--back {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-3);
  background-color: var(--c-panel);
  border-top: var(--bw-heavy) solid var(--tier);
}
.plate--back .facts { padding-top: var(--s-1); }
.plate--back .facts dd { font-size: var(--t-base-sm); line-height: var(--lh-snug); }
.story { margin: 0; max-width: none; font-size: var(--t-base-sm); line-height: 1.5; }
.story.hanzi { color: var(--c-body); }
.credit { margin: 0; max-width: none; font-size: var(--t-xs); line-height: var(--lh-snug); color: var(--c-muted); }

/* Trading-card proportions (63:88, as Pokémon and Magic: The Gathering) for
 * both faces of the portrait layouts. min-height 0 and overflow hidden stop
 * content from stretching the face. */
.card--framed .face, .card--full-art .face { aspect-ratio: 63 / 88; min-height: 0; overflow: hidden; }

/* A: framed ------------------------------------------------------------- */
.card--framed { max-width: 320px; --name-size: var(--t-xl); }
.card--framed .face--front { gap: var(--s-2); padding: var(--s-3); }
.card--framed .head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-3); padding-bottom: var(--s-2); border-bottom: var(--bw-rule) solid var(--c-rule); }
.card--framed .window { flex: 1; min-height: 0; }
/* The frame's empty bottom rows already clear the plinth, so no extra margin:
 * the 3x figure needs every pixel of the shorter window. */
.card--framed .window .sprite { margin-bottom: 0; }
.card--framed .panel { display: flex; flex-direction: column; gap: var(--s-3); padding: var(--s-3); background-color: var(--c-ground); border: var(--bw-rule) solid var(--c-rule); }
.card--framed .panel--empty { align-items: center; justify-content: center; }
.card--framed .foot { margin-top: auto; padding-top: var(--s-2); border-top: var(--bw-rule) solid var(--c-rule); }

/* B: full art ----------------------------------------------------------- */
.card--full-art { max-width: 320px; --name-size: var(--t-lg); }
.card--full-art .face { overflow: hidden; background-color: var(--c-ink); border-width: var(--bw-frame); }
.card--full-art .face--back { background-color: var(--c-panel); }
.card--full-art .stage { position: absolute; inset: 0; background-color: var(--c-ground); }
.card--full-art .flow {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--s-2);
  min-height: 0;
  padding: var(--s-3);
}
.plate {
  position: relative;
  z-index: 2;
  background-color: var(--c-panel);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.card--full-art .plate--back { border: 0; border-top: var(--bw-heavy) solid var(--tier); box-shadow: none; }
.card--full-art .plate--name { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); padding: var(--s-2) var(--s-3); }
.card--full-art .plate__text { display: flex; flex-direction: column; gap: var(--s-1); min-width: 0; }
.plate--back .plate__text { display: flex; flex-direction: column; gap: var(--s-1); }
/* The figure takes what the plates leave. The sprite's empty headroom rows hang
 * above it, behind the name plate (the plates sit above, z-index 2). */
.card--full-art .figure { position: relative; flex: 1; display: flex; align-items: flex-end; justify-content: center; min-height: 0; padding-bottom: var(--s-2); }
.card--full-art .figure .sprite { position: relative; z-index: 1; }
.card--full-art .figure::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: var(--s-2);
  width: 8rem;
  height: 0.375rem;
  transform: translateX(-50%);
  background-color: var(--c-gold);
  border-top: var(--bw-hair) solid var(--c-ink);
  opacity: 0.9;
}
.card--locked .figure::after { display: none; }
.card--full-art .plate--info { display: flex; flex-direction: column; gap: var(--s-3); padding: var(--s-2) var(--s-3); }
.card--full-art .pinyin { font-size: var(--t-sm); }
.card--full-art .plate--back { z-index: auto; }

/* C: compact ------------------------------------------------------------ */
.card--compact { max-width: 420px; --name-size: var(--t-lead); }
.card--compact .face--front { min-height: 11.25rem; flex-direction: row; gap: var(--s-3); padding: var(--s-3); }
.card--compact .window { flex: none; width: 9rem; height: 9rem; align-self: flex-start; border-width: var(--bw-heavy); }
.card--compact .window::after { width: 4rem; bottom: 0.25rem; }
.card--compact .window .sprite { margin-bottom: 0.25rem; }
.card--compact .body { display: flex; flex: 1; flex-direction: column; gap: var(--s-1); min-width: 0; }
.card--compact .head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-2); }
.card--compact .pinyin { font-size: var(--t-sm); }
.card--compact .quote__zh { font-size: var(--t-base); line-height: var(--lh-snug); }
.card--compact .quote__src { font-size: var(--t-xs); }
.card--compact .line { font-size: var(--t-sm); }
.card--compact .foot { flex-wrap: wrap; margin-top: auto; padding-top: var(--s-1); }
.card--compact .foot__rank, .card--compact .foot__tier { white-space: nowrap; }

@media (max-width: 420px) {
  .card--compact .face--front { gap: var(--s-2); padding: var(--s-2); }
}
</style>
