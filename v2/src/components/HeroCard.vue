<script setup>
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import HeroLine from './HeroLine.vue'
import TierSymbol from './TierSymbol.vue'

// The collectible hero card. One component, three layouts:
//
//   framed    a bordered card: header strip, framed art window, a small facts
//             panel (star and weapon) and a footer (trading-card portrait,
//             63:88, up to 320px wide; sprite at 4x)
//   full-art  the print fills the card; text sits on solid plates laid over it
//             (63:88, up to 320px wide; sprite at 5x, 320px frames)
//   compact   a landscape card for lists and phones (about 420 x 180; sprite 2x)
//
// The card shows no stats, power numbers or abilities: the game rules are not
// defined, and nothing here may imply that one hero is stronger than another.
// The rank is where a hero stands in the novel's own list of 108.
//
// `hero` fields: rank, tier ('天罡' | '地煞'), name, pinyin, nameEn, nickname,
// nicknameEn, and three facts, each { cn, en, pinyin }: `star` (星宿), `weapon`
// (兵器) and `background` (出身, labelled "Background" in English: an occupation or a family position). `pinyin` is
// syllables with tone marks, ONE PER CHINESE CHARACTER (punctuation takes none),
// with " / " between words ("bīng shū / shēn tōng"); each word's pinyin is shown in a
// pop-up over that word (see HeroLine). A string without " / " is one word per syllable.
// If the counts do not match, the line is shown without pinyin and a warning is logged in dev.
// Also an optional quote ({ cn, en, pinyin, sourceCn, sourceEn }), an optional
// story ({ en, cn }) and printCredit ({ en, cn }) for the back of the card (the credit is shown in the print viewer, not on the back face), and
// the image imports print, sprite (a strip of `frames` 64px frames, so 64*frames
// wide and 64 high; `frames` defaults to 4) and silhouette (one 64px frame).
//
// Three optional sprite-placement fields, because the art is rarely centred in
// its 64x64 frame: `bodyX`, the column (0 to 63) the body is centred on, not
// counting a weapon that sticks out to one side (default 32, the middle);
// `headroom`, the number of empty rows at the top of the frame (default 0); and
// `feetRow`, the frame row (0 to 63) the feet stand on (default 63, the bottom
// row). The sprite is shifted by (32 - bodyX) whole sprite pixels so the body
// sits on the card's centre line, and pulled up by `headroom` rows so the empty
// rows cost no card height (they pass behind the name plate). A flat drop
// shadow (24 x 4 frame pixels, translucent navy) is drawn under the feet, on
// the centre line, with its centre at `feetRow`. Locked cards have none.
//
// Name line, every layout: the nickname (绰号, the epithet) and the name read as
// ONE title in the novel's own word order, 大刀关胜: same size, same ink colour,
// same brush font, a small gap between, on ONE line that never wraps. One shared
// size per layout (--name-size) is chosen so the worst case, a four-character
// nickname with a three-character name, fits next to the tier emblem.
//
// `reading` ('guided' by default, or 'immersive') is how much help the card
// gives. It is independent of the interface locale (`lang`).
//   guided     pinyin and English. Pinyin is on demand: each Chinese WORD is a
//              button (see HeroLine) that pops its pinyin up in a small bubble on
//              hover or click, so nothing in the card ever moves. The subline under the name is the nickname
//              in curly quotes, then the pinyin, in BOTH locales: “Great Blade”
//              Guān Shèng. Fact values and the quote are Chinese; the pinyin pops up in a bubble above
//              (the English stays on its own line beneath). The
//              fact labels, the story, the credit and the quote's source follow
//              the interface locale.
//   immersive  Chinese only: no pinyin, no English, nothing Latin on the card
//              (the rank numbers apart). No subline; the fact labels (星宿, 兵器,
//              出身), story, source, credit and locked-card text are Chinese
//              whatever the locale. The flip button stays in the locale: it is
//              interface, not card content.
//
// Front faces carry three facts, in this order: star, weapon, and background
// (framed and full art as a three-row list, compact as its meta line). There is
// no quote on the front. The back is the print band, the name line, the story,
// the quote (Chinese, English when guided, source). A small expand button in the
// corner of the print band opens the whole print in a native modal dialog, with
// its credit beneath (UI locale when guided, Chinese when immersive).
//
// Same text box in every state: on full art and framed fronts the art area has a
// FIXED height (--art-h; full art also fixes the name plate, --name-h, and framed
// its header, --head-h) and the fact plate or panel takes the rest of the card, so
// the plate is the same height whether the card is guided, immersive or locked,
// and the sprite never moves between modes. The plate is compact so the sprite
// gets the room: each fact is ONE row (label, the Chinese, then the English in
// muted small type on the same line, wrapping beneath only when it must). The art
// heights are sized so the guided facts of the longest lab heroes (Guan Sheng's
// weapon and Hu Sanniang's background wrap their English) fit at 320px.
//
// `state`: 'revealed' shows everything; 'locked' swaps the sprite for the
// silhouette, fades the print, and leaves out the name, nickname, the facts, the
// quote and the sprite's shadow. The rank and tier stay: they say where the
// empty slot is.
//
// `face`: 'front' (default) or 'back'. The back shows the print at full
// strength, then a solid plate with the name line, the story and the quote. A locked card has no back: `face` and `flippable` are ignored.
//
// `flippable`: renders both faces and a real button that turns the card over
// (3D rotateY, or a plain swap under prefers-reduced-motion). The hidden face
// is `inert` and `aria-hidden`, so it is neither focusable nor read out. A hero
// with no story has no back and is not flippable.
//
// The two tiers are told apart by emblem, colour and text. The tier emblem
// (TierSymbol) is an MTG-set-symbol-style badge with the rank number on it: a
// cloud ring in gold-to-vermilion for the 36 Heavenly Spirits (天罡), peaks in
// silver-to-navy for the 72 Earthly Fiends (地煞). The icons are "Cloud ring" and
// "Peaks" by Lorc, game-icons.net, CC BY 3.0; the credit is in the print viewer
// and in v2/CREDITS.md. 2.75rem, 2rem in compact; locked cards keep theirs.
const props = defineProps({
  hero: { type: Object, required: true },
  variant: { type: String, default: 'framed', validator: (v) => ['framed', 'full-art', 'compact'].includes(v) },
  state: { type: String, default: 'revealed', validator: (v) => ['revealed', 'locked'].includes(v) },
  face: { type: String, default: 'front', validator: (v) => ['front', 'back'].includes(v) },
  flippable: { type: Boolean, default: false },
  // How much help the card gives: pinyin and English, or Chinese only. Independent of the locale.
  reading: { type: String, default: 'guided', validator: (v) => ['guided', 'immersive'].includes(v) }
})

const { t, locale } = useI18n()

const locked = computed(() => props.state === 'locked')
const immersive = computed(() => props.reading === 'immersive')
// Chinese is the language of the card's own text in immersive mode and in the cn locale.
const zh = computed(() => immersive.value || locale.value === 'cn')
// Card copy: Chinese whatever the locale when immersive; the flip button uses t() directly.
const msg = (key, named = {}) => (immersive.value ? t(key, named, { locale: 'cn' }) : t(key, named))
const heavenly = computed(() => props.hero.tier === '天罡')
const tierGloss = computed(() => msg(heavenly.value ? 'heroCardTierHeavenly' : 'heroCardTierEarthly'))
const rankText = computed(() => msg('heroCardRank', { n: props.hero.rank }))
// Full art has no visible footer, so its screen-reader text carries the tier too.
const rankTierText = computed(() => msg('heroCardRankTier', { n: props.hero.rank, tier: tierGloss.value }))
const lockedText = computed(() => msg('heroCardLocked'))
const quote = computed(() => props.hero.quote || null)
const quoteSource = computed(() => (quote.value ? (zh.value ? quote.value.sourceCn : quote.value.sourceEn) : ''))
// Second line under the name (guided only): the nickname in curly quotes, then the pinyin,
// matching the Chinese order (“Great Blade” Guān Shèng), in both locales.
const subline = computed(() => `\u201C${props.hero.nicknameEn}\u201D ${props.hero.pinyin}`)
const showSub = computed(() => !locked.value && !immersive.value)
const artLabel = computed(() =>
  locked.value
    ? msg('heroCardArtLocked')
    : msg('heroCardArt', { name: zh.value ? props.hero.name : props.hero.nameEn }))

// The three facts, in front-face order.
const facts = computed(() => [
  ['star', 'heroCardStar', props.hero.star],
  ['weapon', 'heroCardWeapon', props.hero.weapon],
  ['background', 'heroCardBackground', props.hero.background]
].filter(([, , f]) => f).map(([key, label, f]) => ({ key, label: msg(label), cn: f.cn, pinyin: f.pinyin, en: immersive.value ? '' : f.en })))

const story = computed(() => (props.hero.story ? (zh.value ? props.hero.story.cn : props.hero.story.en) : ''))
// Shown in the print viewer, not on the back face itself.
const printCredit = computed(() => (props.hero.printCredit ? (zh.value ? props.hero.printCredit.cn : props.hero.printCredit.en) : ''))

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

// Pinyin bubbles: one pinned per card. Escape, a click outside and flipping close it.
const openId = ref(null)
const root = ref(null)
provide('heroPinyin', { openId })
watch(showBack, () => { openId.value = null })
const onKey = (e) => { if (e.key === 'Escape') openId.value = null }
const onPointer = (e) => { if (openId.value && !(e.target instanceof Element && root.value?.contains(e.target) && e.target.closest('.hl__btn'))) openId.value = null }
onMounted(() => { document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onPointer) })
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer) })
// The print viewer: a native modal dialog on the back face.
const viewer = ref(null)
const expandBtn = ref(null)
const openViewer = () => { if (viewer.value && !viewer.value.open) viewer.value.showModal() }
const closeViewer = () => { viewer.value?.close() }
const onViewerClick = (e) => { if (e.target === viewer.value) closeViewer() }
const sideText = computed(() => t(backUp.value ? 'heroCardShowingBack' : 'heroCardShowingFront'))

// Whole-number sprite scale, so the pixel art stays crisp: 5x (320px frames) in
// full art, 4x framed, 2x compact. A full-art hero needs the empty headroom rows
// to pull the drawn part up into the 14rem figure (Guan Sheng: 43 drawn rows).
const scale = computed(() => (props.variant === 'compact' ? 2 : props.variant === 'full-art' ? 5 : 4))
const spriteStyle = computed(() => ({
  '--k': scale.value,
  '--n': props.hero.frames || 4,
  '--bx': props.hero.bodyX ?? 32,
  '--hr': props.hero.headroom ?? 0,
  '--fr': props.hero.feetRow ?? 63,
  backgroundImage: `url("${locked.value ? props.hero.silhouette : props.hero.sprite}")`
}))
// The drop shadow under the feet needs only the scale and the feet row.
const shadeStyle = computed(() => ({ '--k': scale.value, '--fr': props.hero.feetRow ?? 63 }))
</script>

<template>
  <article
    ref="root"
    class="card"
    :class="[`card--${variant}`, `card--${reading}`, heavenly ? 'card--heavenly' : 'card--earthly', { 'card--locked': locked, 'card--flippable': canFlip }]"
    :data-reading="reading"
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
                    <h3 class="name brush">{{ locked ? msg('heroCardLockedName') : hero.name }}</h3>
                  </div>
                  <p v-if="showSub" class="pinyin">{{ subline }}</p>
                </div>
                <span class="sr-only">{{ rankTierText }}</span>
                <TierSymbol :tier="heavenly ? 'heavenly' : 'earthly'" :rank="hero.rank" />
              </header>

              <div class="figure">
                <i v-if="!locked" class="shade" :style="shadeStyle" aria-hidden="true"></i>
                <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
              </div>

              <div class="plate plate--info">
                <template v-if="!locked">
                  <dl class="facts">
                    <div v-for="f in facts" :key="f.key" :data-fact="f.key">
                      <dt>{{ f.label }}</dt>
                      <dd><HeroLine :cn="f.cn" :pinyin="f.pinyin" :en="f.en" :ruby="!immersive" /></dd>
                    </div>
                  </dl>
                </template>
                <p v-else class="line">{{ lockedText }}</p>
              </div>
            </div>
          </template>

          <!-- Compact: art window on the left, text on the right. -->
          <template v-else-if="variant === 'compact'">
            <div class="window" role="img" :aria-label="artLabel">
              <img class="window__print" :src="hero.print" alt="" />
              <div class="window__halftone" aria-hidden="true"></div>
              <i v-if="!locked" class="shade" :style="shadeStyle" aria-hidden="true"></i>
              <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
            </div>

            <div class="body">
              <header class="head">
                <div class="head__text">
                  <div class="namerow">
                    <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
                    <h3 class="name brush">{{ locked ? msg('heroCardLockedName') : hero.name }}</h3>
                  </div>
                  <p v-if="showSub" class="pinyin">{{ subline }}</p>
                </div>
                <TierSymbol :tier="heavenly ? 'heavenly' : 'earthly'" :rank="hero.rank" size="sm" />
              </header>

              <p v-if="!locked" class="meta">
                <span v-for="f in facts" :key="f.key" class="meta__item" :data-fact="f.key">
                  <span class="sr-only">{{ f.label }}: </span>
                  <HeroLine :cn="f.cn" :pinyin="f.pinyin" :en="f.en" :ruby="!immersive" />
                </span>
              </p>
              <p v-else class="line">{{ lockedText }}</p>

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
                  <h3 class="name brush">{{ locked ? msg('heroCardLockedName') : hero.name }}</h3>
                </div>
                <p v-if="showSub" class="pinyin">{{ subline }}</p>
              </div>
              <TierSymbol :tier="heavenly ? 'heavenly' : 'earthly'" :rank="hero.rank" />
            </header>

            <div class="window" role="img" :aria-label="artLabel">
              <img class="window__print" :src="hero.print" alt="" />
              <div class="window__halftone" aria-hidden="true"></div>
              <i v-if="!locked" class="shade" :style="shadeStyle" aria-hidden="true"></i>
              <div class="sprite" :class="{ 'sprite--still': locked }" :style="spriteStyle" aria-hidden="true"></div>
            </div>

            <div v-if="locked" class="panel panel--empty">
              <p class="line">{{ lockedText }}</p>
            </div>
            <div v-else class="panel">
              <dl class="facts">
                <div v-for="f in facts" :key="f.key" :data-fact="f.key">
                  <dt>{{ f.label }}</dt>
                  <dd><HeroLine :cn="f.cn" :pinyin="f.pinyin" :en="f.en" :ruby="!immersive" /></dd>
                </div>
              </dl>
            </div>

            <footer class="foot">
              <span class="sr-only">{{ rankText }}</span>
              <span class="foot__rank mono" aria-hidden="true">{{ hero.rank }} / 108</span>
              <span class="foot__tier"><i class="tick" aria-hidden="true"></i><span class="brush">{{ hero.tier }}</span> {{ tierGloss }}</span>
            </footer>
          </template>
        </div>

        <!-- BACK: the print at full strength (no sprite, no fade, no halftone),
             then a solid plate with the name line, the story, the quote and the
             credit. Never rendered for a locked card. -->
        <div
          v-if="renderBack"
          class="face face--back"
          :inert="backHidden"
          :aria-hidden="backHidden ? 'true' : null"
        >
          <div class="backprint">
            <div class="backprint__art" role="img" :aria-label="msg('heroCardPrintArt')">
              <img class="backprint__img" :src="hero.print" alt="" />
            </div>
            <!-- Outside the role="img" block, so it stays reachable. -->
            <button ref="expandBtn" type="button" class="expandbtn" :aria-label="t('heroCardViewPrint')" @click="openViewer">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true" focusable="false"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" /></svg>
            </button>
          </div>
          <div class="plate plate--back">
            <div class="plate__text">
              <div class="namerow">
                <span v-if="!locked" class="nick__zh brush">{{ hero.nickname }}</span>
                <h3 class="name brush">{{ locked ? msg('heroCardLockedName') : hero.name }}</h3>
              </div>
              <p v-if="showSub" class="pinyin">{{ subline }}</p>
            </div>
            <p class="story" :class="{ hanzi: zh }" :lang="zh ? 'zh-Hans' : 'en'">{{ story }}</p>
            <figure v-if="quote" class="quote">
              <blockquote class="quote__text"><HeroLine :cn="quote.cn" :pinyin="quote.pinyin" :en="immersive ? '' : quote.en" :ruby="!immersive" /></blockquote>
              <figcaption class="quote__src" :lang="zh ? 'zh-Hans' : 'en'">{{ quoteSource }}</figcaption>
            </figure>
          </div>

          <!-- The whole print and its credit, in a native modal dialog. Escape and
               the close button close it and focus goes back to the expand button;
               a click on the backdrop (the dialog element itself) closes it too. -->
          <dialog ref="viewer" class="viewer" :aria-label="msg('heroCardPrintArt')" @click="onViewerClick" @close="expandBtn?.focus()">
            <div class="viewer__body">
              <img class="viewer__img" :src="hero.print" alt="" />
              <p v-if="printCredit" class="viewer__credit" :lang="zh ? 'zh-Hans' : 'en'">{{ printCredit }}</p>
              <p class="viewer__credit-icons" :lang="zh ? 'zh-Hans' : 'en'">
                <i18n-t keypath="heroCardIconCredit" tag="span" scope="global" :locale="zh ? 'cn' : 'en'">
                  <template #site><a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a></template>
                  <template #licence><a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a></template>
                </i18n-t>
              </p>
            </div>
            <button type="button" class="viewer__close" :aria-label="t('heroCardClose')" @click="closeViewer">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true" focusable="false"><path d="M3 3l10 10M13 3 3 13" /></svg>
            </button>
          </dialog>
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
/* Tier colour: one variable the frame and tick read. */
.card {
  --tier: var(--c-red-solid);
  --on-tier: var(--c-on-red);
  /* Name line size, shared by nickname and name. Chosen so four plus three
   * characters fit beside the emblem at each layout's width (set per layout). */
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

/* Nickname then name, one title (大刀关胜): same size, colour and font, a small
 * gap between, one line, never wraps. */
.namerow { display: flex; flex-wrap: nowrap; align-items: baseline; gap: 0 var(--s-1); white-space: nowrap; min-width: 0; }
.nick__zh { flex: none; font-size: var(--name-size); line-height: var(--lh-tight); color: var(--c-ink); }
.namerow .name { flex: none; }
.pinyin { letter-spacing: 0; }

/* The quote, on the back: Chinese, English (when guided), then the source. */
.quote { display: flex; flex-direction: column; gap: 2px; margin: 0; padding-left: var(--s-2); border-left: var(--bw-heavy) solid var(--tier); }
.quote__text { margin: 0; font-size: var(--t-base); line-height: var(--lh-snug); color: var(--c-ink); --hl-en-size: var(--t-sm); }
.quote__src { font-size: var(--t-xs); line-height: var(--lh-snug); color: var(--c-muted); }

/* Three compact fact rows: label, the Chinese, then the English (muted, small)
 * on the same line; the English wraps beneath only when it must. */
.facts { display: grid; gap: 3px; margin: 0; --hl-dir: row; --hl-en-size: var(--t-xs); --hl-en-color: var(--c-muted); }
.facts div { display: grid; grid-template-columns: 4rem 1fr; gap: var(--s-2); align-items: baseline; }
.facts dt { font-size: var(--t-xs); line-height: var(--lh-snug); color: var(--c-muted); }
.facts dd { margin: 0; font-size: var(--t-base-sm); line-height: var(--lh-snug); color: var(--c-ink); min-width: 0; }

.line { margin: 0; font-size: var(--t-base); line-height: var(--lh-snug); color: var(--c-body); }
.meta { display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-3); margin: 0; font-size: var(--t-base-sm); line-height: var(--lh-snug); color: var(--c-ink); --hl-en-size: var(--t-xs); }
.meta__item { min-width: 0; }

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
.window .shade { --base: var(--s-2); }
/* Drop shadow under the feet: a flat translucent navy ellipse, 24 x 4 frame
 * pixels, on the card's centre line (the sprite is shifted so the body sits
 * there), its centre at the feet row. --base is where the sprite's bottom edge
 * sits above the bottom of the container (set per layout). */
.shade {
  --base: 0px;
  position: absolute;
  z-index: 0;
  left: 50%;
  bottom: calc(var(--base) + (63 - var(--fr)) * var(--k) * 1px + var(--k) * 0.5px - var(--k) * 2px);
  width: calc(24px * var(--k));
  height: calc(4px * var(--k));
  transform: translateX(-50%);
  border-radius: 50%;
  background-color: rgba(27, 33, 64, 0.45);
  pointer-events: none;
}
.window .sprite { z-index: 1; }

.card--locked .window__print,
.card--locked .stage__print { opacity: 0.18; filter: saturate(0.4); }
.card--locked .sprite { opacity: 0.9; }

/* Back ------------------------------------------------------------------ */
.face--back { overflow: hidden; }
.backprint { position: relative; flex: 1; min-height: 4.5rem; background-color: var(--c-sunk); }
.backprint__art { position: absolute; inset: 0; }
.backprint__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; opacity: 1; }
.plate--back {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-3);
  background-color: var(--c-panel);
  border-top: var(--bw-heavy) solid var(--tier);
}
.story { margin: 0; max-width: none; font-size: var(--t-base-sm); line-height: 1.5; }
.story.hanzi { color: var(--c-body); }

/* Expand button: a small paper square with the hard shadow, bottom-right of the print band. */
.expandbtn {
  position: absolute;
  right: var(--s-2);
  bottom: var(--s-2);
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  color: var(--c-ink);
  background-color: var(--c-panel);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: 0;
  box-shadow: 2px 2px 0 var(--c-ink);
  cursor: pointer;
}
.expandbtn:hover { background-color: var(--c-ground); }
.expandbtn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--c-ink); }

/* Print viewer: the print whole, its credit beneath, a close button. */
.viewer {
  position: fixed;
  inset: 0;
  margin: auto;
  box-sizing: border-box;
  width: min(94vw, 1200px);
  height: min(92vh, 900px);
  max-width: none;
  max-height: none;
  padding: 0;
  overflow: hidden;
  color: var(--c-body);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.viewer[open] { display: flex; flex-direction: column; }
.viewer::backdrop { background-color: rgba(27, 33, 64, 0.72); }
.viewer__body { display: flex; flex: 1; flex-direction: column; gap: var(--s-3); min-height: 0; padding: var(--s-3); }
.viewer__img { flex: 1; width: 100%; min-height: 0; object-fit: contain; background-color: var(--c-sunk); }
.viewer__credit { margin: 0; max-width: none; padding-right: 3rem; font-size: var(--t-sm); line-height: var(--lh-snug); color: var(--c-muted); }
.viewer__credit-icons { margin: calc(var(--s-3) * -0.5) 0 0; max-width: none; padding-right: 3rem; font-size: var(--t-xs); line-height: var(--lh-snug); color: var(--c-muted); }
.viewer__credit-icons a { color: inherit; text-decoration: underline; }
.viewer__close {
  position: absolute;
  right: var(--s-3);
  bottom: var(--s-3);
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  color: var(--c-on-button);
  background-color: var(--c-button);
  border: var(--bw-heavy) solid var(--c-ink);
  border-radius: 0;
  box-shadow: 2px 2px 0 var(--c-ink);
  cursor: pointer;
}

/* Trading-card proportions (63:88, as Pokémon and Magic: The Gathering) for
 * both faces of the portrait layouts. min-height 0 and overflow hidden stop
 * content from stretching the face. */
.card--framed .face, .card--full-art .face { aspect-ratio: 63 / 88; min-height: 0; overflow: hidden; }

/* A: framed ------------------------------------------------------------- */
.card--framed { max-width: 320px; --name-size: var(--t-xl); --head-h: 4.25rem; --art-h: 12rem; }
.card--framed .face--front { gap: var(--s-2); padding: var(--s-3); }
.card--framed .head { flex: none; box-sizing: border-box; height: var(--head-h); display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-3); padding-bottom: var(--s-2); border-bottom: var(--bw-rule) solid var(--c-rule); }
.card--framed .window { flex: none; box-sizing: border-box; height: var(--art-h); }
/* The frame's empty bottom rows already clear the shadow, so no extra margin.
 * 12rem holds the 4x figure's 43 drawn rows (172px) inside the 4px frame. */
.card--framed .window .sprite { margin-bottom: 0; }
.card--framed .window .shade { --base: 0px; }
.card--framed .panel { display: flex; flex: 1; min-height: 0; flex-direction: column; justify-content: center; gap: var(--s-3); padding: 6px var(--s-3); background-color: var(--c-ground); border: var(--bw-rule) solid var(--c-rule); }
.card--framed .facts { gap: 2px; }
.card--framed .panel--empty { align-items: center; justify-content: center; }
.card--framed .foot { flex: none; padding-top: var(--s-1); border-top: var(--bw-rule) solid var(--c-rule); }

/* B: full art ----------------------------------------------------------- */
.card--full-art { max-width: 320px; --name-size: var(--t-lg); --name-h: 4rem; --art-h: 14rem; }
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
.card--full-art .plate--name { flex: none; box-sizing: border-box; height: var(--name-h); display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); padding: 6px var(--s-3); }
.card--full-art .plate__text { display: flex; flex-direction: column; gap: var(--s-1); min-width: 0; }
.plate--back .plate__text { display: flex; flex-direction: column; gap: var(--s-1); }
/* The figure takes what the plates leave. The sprite's empty headroom rows hang
 * above it, behind the name plate (the plates sit above, z-index 2). */
.card--full-art .figure { position: relative; flex: none; box-sizing: border-box; height: var(--art-h); display: flex; align-items: flex-end; justify-content: center; }
.card--full-art .figure .sprite { position: relative; z-index: 1; }
.card--full-art .figure .shade { --base: 0px; }
.card--full-art .plate--info { display: flex; flex: 1; flex-direction: column; justify-content: center; gap: var(--s-3); min-height: 0; padding: var(--s-2) var(--s-3); }
.card--full-art .pinyin { font-size: var(--t-sm); }
.card--full-art .plate--back { z-index: auto; }

/* C: compact ------------------------------------------------------------ */
.card--compact { max-width: 420px; --name-size: var(--t-lead); }
.card--compact .face--front { min-height: 11.25rem; flex-direction: row; gap: var(--s-3); padding: var(--s-3); }
.card--compact .window { flex: none; width: 9rem; height: 9rem; align-self: flex-start; border-width: var(--bw-heavy); }
.card--compact .window .sprite { margin-bottom: 0.25rem; }
.card--compact .window .shade { --base: 0.25rem; }
.card--compact .body { display: flex; flex: 1; flex-direction: column; gap: var(--s-1); min-width: 0; }
.card--compact .head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-2); }
.card--compact .pinyin { font-size: var(--t-sm); }
.card--compact .line { font-size: var(--t-sm); }
.card--compact .foot { flex-wrap: wrap; margin-top: auto; padding-top: var(--s-1); }
.card--compact .foot__rank, .card--compact .foot__tier { white-space: nowrap; }

@media (max-width: 420px) {
  .card--compact .face--front { gap: var(--s-2); padding: var(--s-2); }
}
</style>
