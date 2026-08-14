<script setup>
import { ref } from 'vue'
import SectionHead from '../components/SectionHead.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import PrintFrame from '../components/PrintFrame.vue'
import ScrollRods from '../components/ScrollRods.vue'
import { useI18n } from 'vue-i18n'
import LanguageMenu from '../components/LanguageMenu.vue'
import AudioButton from '../components/AudioButton.vue'
import { usePreferencesStore } from '../stores/preferences'

// The phase's verification surface: every token and primitive on one page, so
// regressions are visible rather than discovered later in a real screen.

const prefs = usePreferencesStore()
const { t } = useI18n()

// Real interface strings from the design file, shown so the switch can be seen
// to work rather than taken on trust.
const copyKeys = [
  'navHome', 'navQuiz', 'navReview', 'chooseLevel', 'email', 'subscribe',
  'dailyHeadline', 'collectHeadline', 'heroesGathered', 'dayStreak'
]

const surfaces = [
  ['--c-raised', 'raised', 'lightest card'],
  ['--c-panel', 'panel', 'standard panel'],
  ['--c-ground', 'ground', 'page background'],
  ['--c-sunk', 'sunk', 'recessed surface']
]

const inks = [
  ['--c-ink', 'ink', 'text, borders, fills'],
  ['--c-ink-deep', 'ink-deep', 'dark band ground'],
  ['--c-ink-deeper', 'ink-deeper', 'deepest fills'],
  ['--c-ink-edge', 'ink-edge', 'border on dark']
]

const texts = [
  ['--c-body', 'body', 'running text'],
  ['--c-muted', 'muted', 'most used text colour'],
  ['--c-muted-warm', 'muted-warm', 'on warm surfaces'],
  ['--c-pinyin', 'pinyin', 'pronunciation']
]

const rules = [
  ['--c-rule', 'rule', 'standard hairline'],
  ['--c-rule-light', 'rule-light', 'lighter, usually 1.5px'],
  ['--c-rule-faint', 'rule-faint', 'on raised cards'],
  ['--c-rule-gold', 'rule-gold', 'in the dark band']
]

const accents = [
  ['--c-seal', 'seal', 'brush marks, printed emphasis'],
  ['--c-red', 'red', 'bright red text'],
  ['--c-red-solid', 'red-solid', 'solid red fill'],
  ['--c-vermilion', 'vermilion', 'hottest accent'],
  ['--c-button', 'button', 'primary action'],
  ['--c-gold', 'gold', 'dark band only']
]

const groups = [
  ['Surfaces', surfaces], ['Ink', inks], ['Text', texts],
  ['Rules', rules], ['Accents', accents]
]

const radii = [
  ['--r-xs', '6'], ['--r-sm', '8'], ['--r-md', '10'], ['--r-lg', '14'],
  ['--r-xl', '16'], ['--r-2xl', '18'], ['--r-3xl', '28'], ['--r-pill', 'pill']
]

const scale = [
  ['--t-hero', 'hero', '96px'],
  ['--t-3xl', '3xl', '54px'],
  ['--t-2xl', '2xl', '40px'],
  ['--t-xl', 'xl', '30px'],
  ['--t-lg', 'lg', '24px'],
  ['--t-lead', 'lead', '17px'],
  ['--t-body', 'body', '15px'],
  ['--t-sm', 'sm', '12px'],
  ['--t-2xs', '2xs', '10px']
]

// A real HSK word whose forms differ between character sets, so the switch below
// visibly changes the content — 前面 is identical in both and demonstrated nothing.
const word = {
  simplified: '爱护',
  traditional: '愛護',
  pinyin: 'ài hù',
  definition: 'to cherish; to treasure; to take care of'
}
const pressed = ref(0)
</script>

<template>
  <div class="page">
    <ScrollRods position="top" />

    <main class="page__inner">
      <header class="masthead">
        <p class="masthead__eyebrow">Haohaotiantian · 水浒传 redesign</p>
        <h1>Tokens &amp; primitives</h1>
        <p class="masthead__note">
          Phase 1 verification surface. Renders at 390 and 1120.
        </p>
      </header>

      <section class="stack">
        <SectionHead label="Colour" title="Palette" hanzi="色" />
        <p class="note">
          Reconciled against the design file. The brief listed ten colours; the
          design uses these — four reds and four darks, each with a distinct job.
        </p>
        <div v-for="[groupName, items] in groups" :key="groupName" class="group">
          <p class="label">{{ groupName }}</p>
          <div class="swatches">
            <div v-for="[token, name, use] in items" :key="token" class="swatch">
              <span
                class="swatch__chip"
                :style="{ backgroundColor: `var(${token})` }"
                aria-hidden="true"
              ></span>
              <span class="swatch__name">{{ name }}</span>
              <span class="swatch__use">{{ use }}</span>
              <code class="swatch__token mono">{{ token }}</code>
            </div>
          </div>
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Type" title="Scale and faces" hanzi="字" />
        <div class="scale">
          <div v-for="[token, name, use] in scale" :key="token" class="scale__row">
            <span class="scale__label mono">{{ name }}</span>
            <span class="scale__sample" :style="{ fontSize: `var(${token})` }">
              Climb the mountain
            </span>
            <span class="scale__use">{{ use }}</span>
          </div>
        </div>

        <div class="faces">
          <AppPanel>
            <p class="faces__label">Display · Archivo 800/900</p>
            <p class="faces__display">Unite the 108</p>
          </AppPanel>
          <AppPanel>
            <p class="faces__label">Brush · Ma Shan Zheng</p>
            <p class="brush faces__brush">上山聚义</p>
          </AppPanel>
          <AppPanel>
            <p class="faces__label">Hanzi · Noto Serif SC</p>
            <p class="hanzi faces__hanzi">共一百零八人</p>
          </AppPanel>
          <AppPanel>
            <p class="faces__label">Hanzi UI · Noto Sans SC</p>
            <p class="hanzi-ui faces__hanzi">订阅每日一词</p>
          </AppPanel>
          <AppPanel>
            <p class="faces__label">Serif · Instrument Serif</p>
            <p class="serif faces__serif">One word a day</p>
          </AppPanel>
          <AppPanel>
            <p class="faces__label">Mono · DM Mono</p>
            <p class="mono faces__mono">HSK 1–6 · 2 734 characters</p>
          </AppPanel>
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Word card" title="Daily word" hanzi="每日一词" />
        <div class="wordcard-row">
          <AppPanel class="wordcard">
            <p class="hanzi wordcard__hanzi">{{ prefs.renderWord(word) }}</p>
            <p class="pinyin">{{ word.pinyin }}</p>
            <p class="wordcard__def">{{ word.definition }}</p>
          </AppPanel>
          <div class="charset">
            <p class="faces__label">Character set</p>
            <div class="charset__buttons">
              <AppButton
                :variant="prefs.characterSet === 'simplified' ? 'primary' : 'quiet'"
                @click="prefs.setCharacterSet('simplified')"
              >
                简体
              </AppButton>
              <AppButton
                :variant="prefs.characterSet === 'traditional' ? 'primary' : 'quiet'"
                @click="prefs.setCharacterSet('traditional')"
              >
                繁體
              </AppButton>
            </div>
            <p class="charset__note">
              Persists to localStorage — reload and it holds.
            </p>
          </div>
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Audio" title="Pronunciation button" hanzi="音" />
        <p class="note">
          Words without a recording render no button at all, rather than one that
          clicks and does nothing — two of the Vue 2 word cards did the latter.
          The disabled form is only used where a layout needs the space held.
        </p>
        <div class="audio-states">
          <div class="audio-state">
            <AudioButton
              src="https://s3.us-east-1.amazonaws.com/vocab-audio-prod/audio/example.mp3"
              label="爱护"
            />
            <span class="mono audio-state__label">has audio</span>
          </div>
          <div class="audio-state">
            <AudioButton src="" label="爱护" show-when-missing />
            <span class="mono audio-state__label">no recording (placeholder)</span>
          </div>
          <div class="audio-state">
            <span class="audio-state__none">— nothing rendered —</span>
            <span class="mono audio-state__label">no recording (default)</span>
          </div>
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Shape" title="Corner radius" />
        <p class="note">
          The brief called for zero radius everywhere. The design uses a full
          scale, so the global reset was removed.
        </p>
        <div class="radii">
          <div v-for="[token, px] in radii" :key="token" class="radius">
            <span class="radius__box" :style="{ borderRadius: `var(${token})` }" aria-hidden="true"></span>
            <code class="mono radius__label">{{ px }}</code>
          </div>
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Controls" title="Buttons" />
        <div class="buttons">
          <AppButton variant="primary" @click="pressed++">Subscribe</AppButton>
          <AppButton variant="seal" @click="pressed++">Take the quiz</AppButton>
          <AppButton variant="solid" @click="pressed++">Unsubscribe</AppButton>
          <AppButton variant="quiet" @click="pressed++">Review words</AppButton>
          <AppButton variant="primary" shape="sm" @click="pressed++">Square</AppButton>
          <AppButton variant="primary" disabled>Unavailable</AppButton>
        </div>
        <p class="mono buttons__count">pressed: {{ pressed }}</p>
      </section>

      <section class="stack">
        <SectionHead label="Prints" title="Frames" hanzi="印" />
        <div class="prints">
          <PrintFrame ratio="4 / 5" />
          <PrintFrame ratio="1 / 1" />
          <PrintFrame ratio="3 / 2" />
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Language" :title="t('navHome') ? 'Interface language' : ''" hanzi="语" />
        <p class="note">
          Interface language is a separate axis from the character set above: this
          switches the chrome, that switches how vocabulary renders. Copy comes
          from the design file, so both columns are the real strings.
        </p>
        <div class="lang">
          <LanguageMenu />
          <p class="lang__state mono">locale: {{ prefs.language }} · characterSet: {{ prefs.characterSet }}</p>
        </div>
        <div class="copy">
          <div v-for="key in copyKeys" :key="key" class="copy__row">
            <code class="copy__key mono">{{ key }}</code>
            <span class="copy__val" :class="{ 'hanzi-ui': prefs.language === 'cn' }">{{ t(key) }}</span>
          </div>
        </div>
      </section>

      <section class="stack">
        <SectionHead label="Band" title="Dark treatment" />
        <AppPanel band>
          <h3>上山聚义，共一百零八人。</h3>
          <p class="band__body">
            Climb the mountain. Unite the 108. Gold is legible only here, which is
            why the token is documented as band-only.
          </p>
          <p class="band__gold">Gathered · 12 of 108</p>
        </AppPanel>
      </section>
    </main>

    <ScrollRods position="bottom" />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  min-height: 100vh;
  padding: var(--s-4) 0;
}

.page__inner {
  display: flex;
  flex-direction: column;
  gap: var(--s-16);
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--s-4);
}

.masthead {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.masthead__eyebrow {
  font-family: var(--f-label);
  font-size: var(--t-sm);
  font-weight: var(--w-semi);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--c-seal);
}

.masthead__note { color: var(--c-muted); font-size: var(--t-sm); }

.stack { display: flex; flex-direction: column; gap: var(--s-6); }

/* --- colour --- */
.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--s-4);
}

.swatch {
  border-radius: var(--r-sm);
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: 'chip name' 'chip use' 'token token';
  align-items: center;
  gap: var(--s-1) var(--s-3);
  padding: var(--s-3);
  border: var(--bw-hair) solid var(--c-rule);
  background-color: var(--c-panel);
}

.swatch__chip {
  grid-area: chip;
  width: 40px;
  height: 40px;
  border: var(--bw-hair) solid var(--c-ink);
  border-radius: var(--r-xs);
}

.swatch__name { grid-area: name; color: var(--c-ink); font-weight: var(--w-semi); }
.swatch__use { grid-area: use; font-size: var(--t-xs); color: var(--c-muted); }
.swatch__token {
  grid-area: token;
  font-size: var(--t-2xs);
  color: var(--c-muted);
  padding-top: var(--s-1);
}

/* --- type --- */
.scale { display: flex; flex-direction: column; gap: var(--s-3); }

.scale__row {
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  align-items: baseline;
  gap: var(--s-4);
  padding-bottom: var(--s-3);
  border-bottom: var(--bw-hair) solid var(--c-rule);
}

.scale__label { font-size: var(--t-sm); color: var(--c-muted); }

.group { display: flex; flex-direction: column; gap: var(--s-3); }

.note {
  color: var(--c-muted);
  font-size: var(--t-base);
  max-width: var(--measure);
}

.audio-states { display: flex; flex-wrap: wrap; gap: var(--s-8); }
.audio-state { display: flex; align-items: center; gap: var(--s-3); }
.audio-state__label { font-size: var(--t-sm); color: var(--c-muted); }
.audio-state__none {
  font-size: var(--t-sm);
  color: var(--c-muted);
  font-style: italic;
}

.lang { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }
.lang__state { font-size: var(--t-sm); color: var(--c-muted); }

.copy { display: flex; flex-direction: column; }
.copy__row {
  display: grid;
  grid-template-columns: 11rem 1fr;
  gap: var(--s-4);
  padding: var(--s-3) 0;
  border-bottom: var(--bw-hair) solid var(--c-rule);
  align-items: baseline;
}
.copy__key { font-size: var(--t-sm); color: var(--c-muted); }
.copy__val { color: var(--c-ink); min-width: 0; overflow-wrap: anywhere; }

.radii { display: flex; flex-wrap: wrap; gap: var(--s-4); }
.radius { display: flex; flex-direction: column; align-items: center; gap: var(--s-2); }
.radius__box {
  width: 64px;
  height: 64px;
  background-color: var(--c-button);
  border: var(--bw-rule) solid var(--c-ink);
}
.radius__label { font-size: var(--t-sm); color: var(--c-muted); }
.faces__serif { font-size: var(--t-lg); }
.scale__sample {
  font-family: var(--f-display);
  font-weight: var(--w-heavy);
  color: var(--c-ink);
  line-height: var(--lh-tight);
  /* Grid children default to min-width:auto, so at 390px the 96px sample could
   * not shrink below its own text and pushed the page sideways. */
  min-width: 0;
  overflow-wrap: anywhere;
}
.scale__use { display: none; }

.faces {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--s-4);
}

.faces__label {
  font-family: var(--f-label);
  font-size: var(--t-sm);
  font-weight: var(--w-semi);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--c-muted);
}

.faces__display { font-family: var(--f-display); font-weight: var(--w-black); font-size: var(--t-xl); color: var(--c-ink); }
.faces__brush { font-size: var(--t-2xl); }
.faces__hanzi { font-size: var(--t-lg); font-weight: var(--w-bold); }
.faces__mono { font-size: var(--t-sm); }

/* --- word card --- */
.wordcard-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--s-6);
}

.wordcard__hanzi { font-size: var(--t-3xl); line-height: var(--lh-tight); }
.wordcard__def { color: var(--c-body); }

.charset { display: flex; flex-direction: column; gap: var(--s-3); }
.charset__buttons { display: flex; gap: var(--s-3); }
.charset__note { font-size: var(--t-xs); color: var(--c-muted); }

/* --- controls --- */
.buttons { display: flex; flex-wrap: wrap; gap: var(--s-4); }
.buttons__count { font-size: var(--t-xs); color: var(--c-muted); }

/* --- prints --- */
.prints {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--s-4);
  align-items: start;
}

/* --- band --- */
.band__body { color: var(--c-on-dark); opacity: 0.85; }
.band__gold {
  font-family: var(--f-label);
  font-weight: var(--w-semi);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  font-size: var(--t-sm);
  color: var(--c-gold);
}

@media (min-width: 720px) {
  .page__inner { padding: 0 var(--s-8); }
  .scale__row { grid-template-columns: 3.5rem 1fr 10rem; }
  .scale__use { display: block; font-size: var(--t-xs); color: var(--c-muted); text-align: right; }
  .wordcard-row { grid-template-columns: minmax(0, 22rem) 1fr; align-items: start; }
}
</style>
