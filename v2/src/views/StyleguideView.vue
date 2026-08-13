<script setup>
import { ref } from 'vue'
import SectionHead from '../components/SectionHead.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import PrintFrame from '../components/PrintFrame.vue'
import ScrollRods from '../components/ScrollRods.vue'
import { usePreferencesStore } from '../stores/preferences'

// The phase's verification surface: every token and primitive on one page, so
// regressions are visible rather than discovered later in a real screen.

const prefs = usePreferencesStore()

const colours = [
  ['--c-ground', 'ground', 'page background'],
  ['--c-panel', 'panel', 'lifted surface'],
  ['--c-rule', 'rule', 'hairlines and borders'],
  ['--c-ink', 'ink', 'headings, borders'],
  ['--c-body', 'body', 'running text'],
  ['--c-muted', 'muted', 'captions, metadata'],
  ['--c-seal', 'seal', 'marks and emphasis'],
  ['--c-button', 'button', 'primary action'],
  ['--c-pinyin', 'pinyin', 'pronunciation'],
  ['--c-gold', 'gold', 'dark band only']
]

const scale = [
  ['--t-3xl', '3xl', 'page title'],
  ['--t-2xl', '2xl', 'section title'],
  ['--t-xl', 'xl', 'card heading'],
  ['--t-lg', 'lg', 'lead'],
  ['--t-base', 'base', 'body'],
  ['--t-sm', 'sm', 'caption'],
  ['--t-xs', 'xs', 'label']
]

// A real word from the HSK data rather than placeholder text, so the CJK subset
// is genuinely exercised.
const word = {
  simplified: '前面',
  traditional: '前面',
  pinyin: 'qián miàn',
  definition: 'in front; ahead; above'
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
        <div class="swatches">
          <div v-for="[token, name, use] in colours" :key="token" class="swatch">
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
        <SectionHead label="Controls" title="Buttons" />
        <div class="buttons">
          <AppButton variant="primary" @click="pressed++">Subscribe</AppButton>
          <AppButton variant="seal" @click="pressed++">Take the quiz</AppButton>
          <AppButton variant="quiet" @click="pressed++">Review words</AppButton>
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
  font-size: var(--t-xs);
  font-weight: 600;
  letter-spacing: 0.14em;
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
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: 'chip name' 'chip use' 'token token';
  align-items: center;
  gap: var(--s-1) var(--s-3);
  padding: var(--s-3);
  border: 1px solid var(--c-rule);
  background-color: var(--c-panel);
}

.swatch__chip {
  grid-area: chip;
  width: 40px;
  height: 40px;
  border: var(--border-w) solid var(--c-ink);
}

.swatch__name { grid-area: name; color: var(--c-ink); font-weight: 600; }
.swatch__use { grid-area: use; font-size: var(--t-xs); color: var(--c-muted); }
.swatch__token {
  grid-area: token;
  font-size: var(--t-xs);
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
  border-bottom: 1px solid var(--c-rule);
}

.scale__label { font-size: var(--t-xs); color: var(--c-muted); }
.scale__sample {
  font-family: var(--f-display);
  font-weight: 800;
  color: var(--c-ink);
  line-height: var(--lh-tight);
}
.scale__use { display: none; }

.faces {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--s-4);
}

.faces__label {
  font-family: var(--f-label);
  font-size: var(--t-xs);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.faces__display { font-family: var(--f-display); font-weight: 900; font-size: var(--t-xl); color: var(--c-ink); }
.faces__brush { font-size: var(--t-2xl); }
.faces__hanzi { font-size: var(--t-xl); font-weight: 700; }
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
.band__body { color: var(--c-band-text); opacity: 0.85; }
.band__gold {
  font-family: var(--f-label);
  font-weight: 600;
  letter-spacing: 0.08em;
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
