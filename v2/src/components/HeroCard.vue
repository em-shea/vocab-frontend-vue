<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// The collectible hero card. One component, three layouts:
//
//   framed    a bordered card: header strip, framed art window, nickname,
//             a small info panel and a footer (portrait, about 320px wide)
//   full-art  the print fills the card; text sits on solid plates laid over it
//   compact   a landscape card for lists and phones (about 420 x 180)
//
// The card shows no stats, power numbers or abilities: the game rules are not
// defined, and nothing here may imply that one hero is stronger than another.
// The rank is where a hero stands in the novel's own list of 108.
//
// `hero` fields: rank, tier ('天罡' | '地煞'), name, pinyin, nameEn, nickname,
// nicknameEn, star, starEn, weapon, weaponEn, an optional quote
// ({ cn, en, sourceCn, sourceEn }; a hero without one simply shows no quote),
// and the image imports print, sprite (a strip of `frames` 64px frames, so
// 64*frames wide and 64 high; `frames` defaults to 4) and silhouette (one 64px
// frame).
//
// `state`: 'revealed' shows everything; 'locked' swaps the sprite for the
// silhouette, fades the print, and leaves out the name, nickname, star, weapon
// and quote. The rank and tier stay: they say where the empty slot is.
//
// The two tiers are told apart by colour alone as well as by text: vermilion
// seal and frame for the 36 Heavenly Spirits, navy for the 72 Earthly Fiends.
const props = defineProps({
  hero: { type: Object, required: true },
  variant: { type: String, default: 'framed', validator: (v) => ['framed', 'full-art', 'compact'].includes(v) },
  state: { type: String, default: 'revealed', validator: (v) => ['revealed', 'locked'].includes(v) }
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
// Second line under the name: pinyin, then the English nickname in English.
const subline = computed(() => (chinese.value ? props.hero.pinyin : `${props.hero.pinyin} · ${props.hero.nicknameEn}`))
const artLabel = computed(() =>
  locked.value
    ? t('heroCardArtLocked')
    : t('heroCardArt', { name: chinese.value ? props.hero.name : props.hero.nameEn }))

// Whole-number sprite scale: 3x of the 64px frame in the tall layouts, 2x in
// the compact one, so the pixel art stays crisp.
const scale = computed(() => (props.variant === 'compact' ? 2 : 3))
const spriteStyle = computed(() => ({
  '--k': scale.value,
  '--n': props.hero.frames || 4,
  backgroundImage: `url("${locked.value ? props.hero.silhouette : props.hero.sprite}")`
}))
</script>

<template>
  <article
    class="card"
    :class="[`card--${variant}`, heavenly ? 'card--heavenly' : 'card--earthly', { 'card--locked': locked }]"
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
              <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
              <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
            </div>
            <p v-if="!locked" class="pinyin">{{ subline }}</p>
          </div>
          <span class="sr-only">{{ rankTierText }}</span>
          <span class="seal" aria-hidden="true">{{ hero.rank }}</span>
        </header>

        <div class="figure">
          <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
        </div>

        <div class="plate plate--info">
          <template v-if="!locked">
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
              <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
              <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
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
            <h3 class="name brush">{{ locked ? t('heroCardLockedName') : hero.name }}</h3>
            <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
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

      <div v-if="!locked" class="panel">
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
        <figure v-if="quote" class="quote">
          <blockquote class="quote__zh hanzi" lang="zh-Hans">{{ quote.cn }}</blockquote>
          <p v-if="!chinese" class="quote__en" lang="en">{{ quote.en }}</p>
          <figcaption class="quote__src">{{ quoteSource }}</figcaption>
        </figure>
      </div>
      <div v-else class="panel panel--empty">
        <p class="line">{{ t('heroCardLocked') }}</p>
      </div>

      <footer class="foot">
        <span class="sr-only">{{ rankText }}</span>
        <span class="foot__rank mono" aria-hidden="true">{{ hero.rank }} / 108</span>
        <span class="foot__tier"><i class="tick" aria-hidden="true"></i><span class="brush">{{ hero.tier }}</span> {{ tierGloss }}</span>
      </footer>
    </template>
  </article>
</template>

<style scoped>
/* Tier colour: one variable the frame, seal and tick all read. */
.card {
  --tier: var(--c-red-solid);
  --on-tier: var(--c-on-red);
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  color: var(--c-body);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--tier);
  box-shadow: var(--shadow-hard);
}
.card--earthly {
  --tier: var(--c-ink);
  --on-tier: var(--c-on-button);
}

/* Shared pieces ------------------------------------------------------- */
.name { margin: 0; font-size: var(--t-xl); line-height: var(--lh-tight); font-weight: var(--w-body); }
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

.namerow { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 var(--s-2); }
.nick__zh { font-size: var(--t-md); line-height: var(--lh-tight); color: var(--c-seal); }
.pinyin { letter-spacing: 0; }

/* The quote: Chinese in the study face, the English translation in body text,
 * a small muted attribution. Plain text, no decorative marks. */
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
  flex: none;
  width: calc(64px * var(--k));
  height: calc(64px * var(--k));
  background-repeat: no-repeat;
  background-size: calc(var(--n) * 64px * var(--k)) calc(64px * var(--k));
  background-position: 0 0;
  image-rendering: pixelated;
  animation: idle calc(var(--n) * 0.16s) steps(var(--n)) infinite;
}
.sprite--still {
  /* The silhouette is a single frame. */
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
.window {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  background-color: var(--c-sunk);
  border: var(--bw-frame) solid var(--c-ink);
}
.window__print, .stage__print {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
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
/* A flat ground line under the feet, in the ochre of the prints. */
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

/* Locked: the print is faded under a sheet of paper, the sprite is a flat
 * silhouette, and nothing says who it is. */
.card--locked .window__print,
.card--locked .stage__print { opacity: 0.35; filter: saturate(0.4); }
.card--locked .window::after { display: none; }
.card--locked .sprite { opacity: 0.9; }

/* A: framed ------------------------------------------------------------- */
.card--framed {
  max-width: 320px;
  gap: var(--s-3);
  padding: var(--s-3);
}
.card--framed .head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-3); padding-bottom: var(--s-3); border-bottom: var(--bw-rule) solid var(--c-rule); }
.card--framed .window { height: 14rem; }
.card--framed .panel { display: flex; flex-direction: column; gap: var(--s-3); padding: var(--s-3); background-color: var(--c-ground); border: var(--bw-rule) solid var(--c-rule); }
.card--framed .panel--empty { align-items: center; justify-content: center; min-height: 5.5rem; }
.card--framed .foot { margin-top: auto; padding-top: var(--s-3); border-top: var(--bw-rule) solid var(--c-rule); }

/* B: full art ----------------------------------------------------------- */
.card--full-art {
  max-width: 320px;
  min-height: 34rem;
  overflow: hidden;
  background-color: var(--c-ink);
  border-width: var(--bw-frame);
}
.card--full-art .stage { position: absolute; inset: 0; background-color: var(--c-sunk); }
.card--full-art .flow {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-3);
}
.plate {
  background-color: var(--c-panel);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.card--full-art .plate--name { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); padding: var(--s-2) var(--s-3); }
.card--full-art .plate__text { display: flex; flex-direction: column; gap: var(--s-1); min-width: 0; }
.card--full-art .figure { position: relative; flex: 1; display: flex; align-items: flex-end; justify-content: center; padding-bottom: var(--s-2); }
.card--full-art .figure .sprite { position: relative; z-index: 1; }
/* The same ochre ground line the art windows have, under the feet. */
.card--full-art .figure::after {
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
.card--locked .figure::after { display: none; }
.card--full-art .plate--info { display: flex; flex-direction: column; gap: var(--s-3); padding: var(--s-3); }
.card--full-art .quote { padding-top: var(--s-3); border-top: var(--bw-rule) solid var(--c-rule); }

/* C: compact ------------------------------------------------------------ */
.card--compact {
  max-width: 420px;
  min-height: 11.25rem;
  flex-direction: row;
  gap: var(--s-3);
  padding: var(--s-3);
}
.card--compact .window { flex: none; width: 9rem; height: 9rem; align-self: flex-start; border-width: var(--bw-heavy); }
.card--compact .window::after { width: 4rem; bottom: 0.25rem; }
.card--compact .window .sprite { margin-bottom: 0.25rem; }
.card--compact .body { display: flex; flex: 1; flex-direction: column; gap: var(--s-1); min-width: 0; }
.card--compact .head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-2); }
.card--compact .name { font-size: var(--t-lg); }
.card--compact .pinyin { font-size: var(--t-sm); }
.card--compact .nick__zh { font-size: var(--t-body-lg); }
.card--compact .quote__zh { font-size: var(--t-base); line-height: var(--lh-snug); }
.card--compact .quote__src { font-size: var(--t-xs); }
.card--compact .line { font-size: var(--t-sm); }
.card--compact .foot { margin-top: auto; padding-top: var(--s-1); }

@media (max-width: 420px) {
  .card--compact { gap: var(--s-2); padding: var(--s-2); }
}
</style>
