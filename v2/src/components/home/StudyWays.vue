<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import PrintFrame from '../PrintFrame.vue'
import printStory from '../../assets/prints/hero-story.jpg'
import SoonNote from './SoonNote.vue'

// Ways to practise: a heading, then one section per kind of practice, each with
// a small illustration of the screen beside its text, like the daily email. The
// mocks are decorative and fixed: the study words are literal so the examples
// are always correct, and nothing in them is interactive. Both versions list
// quizzes and example sentences.
// The heroes version adds sentence writing and handwriting, both unbuilt. The
// launch version adds the review screen. Sides alternate from one to the next.
defineProps({ heroes: { type: Boolean, default: false } })
const { t } = useI18n()
</script>

<template>
  <div class="ways">
    <!-- A thin strip of a print as a break before the practice sections. -->
    <PrintFrame class="strip" ratio="8 / 1" :src="printStory" alt="" />
    <SectionHead :title="t('studyHeadline')" />
    <section class="split">
      <div class="split__text">
        <SectionHead as="h3" :title="t('quizHeadline')" />
        <p>{{ t('quizBody') }}</p>
      </div>
      <div class="stage">
        <figure class="mock mock--quiz" :aria-label="t('mockQuizLabel')">
          <div class="mock__body" aria-hidden="true">
            <p class="mock__prompt">{{ t('mockQuizPrompt') }}</p>
            <p class="hanzi mock__word">爱护</p>
            <p class="pinyin">ài hù</p>
            <ul class="opts">
              <li class="opt opt--right">{{ t('emailMeaning') }}</li>
              <li class="opt">{{ t('mockOptionB') }}</li>
              <li class="opt opt--wrong">{{ t('mockOptionC') }}</li>
              <li class="opt">{{ t('mockOptionD') }}</li>
            </ul>
          </div>
        </figure>
      </div>
    </section>
    <section class="split split--flip">
      <div class="split__text">
        <SectionHead as="h3">{{ t('examplesHeadline') }}</SectionHead>
        <p>{{ t('examplesBody') }}</p>
      </div>
      <div class="stage">
        <figure class="mock mock--examples" :aria-label="t('mockExamplesLabel')">
          <div class="mock__bar" aria-hidden="true">
            <span class="hanzi mock__barword">爱护</span>
            <span class="pinyin">ài hù</span>
          </div>
          <div class="mock__body" aria-hidden="true">
            <p class="hanzi mock__sentence">我们要<mark class="hit">爱护</mark>环境。</p>
            <p class="pinyin">Wǒmen yào <mark class="hit hit--latin">àihù</mark> huánjìng.</p>
            <i18n-t keypath="mockExampleTranslation" tag="p" class="mock__gloss">
              <template #hit><mark class="hit hit--plain">{{ t('mockExampleHit') }}</mark></template>
            </i18n-t>
          </div>
        </figure>
      </div>
    </section>
    <template v-if="heroes">
  <section class="split">
        <div class="split__text">
          <SectionHead as="h3">{{ t('sentenceHeadline') }}</SectionHead>
          <SoonNote />
          <p>{{ t('sentenceBody') }}</p>
        </div>
        <div class="stage">
          <figure class="mock mock--sentence" :aria-label="t('mockSentenceLabel')">
            <div class="mock__bar" aria-hidden="true">
              <span class="hanzi mock__barword">爱护</span>
              <span class="pinyin">ài hù</span>
            </div>
            <div class="mock__body" aria-hidden="true">
              <div class="field">
                <span class="hanzi field__text"><span class="field__typed">请爱护你的书。</span></span>
              </div>
            </div>
          </figure>
        </div>
      </section>
  <section class="split split--flip">
        <div class="split__text">
          <SectionHead as="h3">{{ t('writeHeadline') }}</SectionHead>
          <SoonNote />
          <p>{{ t('writeBody') }}</p>
        </div>
        <div class="stage">
          <figure class="mock mock--write" :aria-label="t('mockWriteLabel')">
            <div class="mock__body mock__body--write" aria-hidden="true">
              <div class="grid">
                <span class="hanzi grid__char">好</span>
              </div>
              <span class="upload"><span class="upload__icon"></span>{{ t('mockUploadPhoto') }}</span>
            </div>
          </figure>
        </div>
      </section>
    </template>
    <template v-else>
  <section class="split">
        <div class="split__text">
          <SectionHead as="h3" :title="t('studyReviewHeadline')" />
          <p>{{ t('studyReviewBody') }}</p>
        </div>
        <div class="stage">
          <figure class="mock mock--review" :aria-label="t('mockReviewLabel')">
            <div class="mock__bar mock__bar--split" aria-hidden="true">
              <span class="mock__title">{{ t('mockReviewTitle') }}</span>
              <span class="export">{{ t('mockExport') }}</span>
            </div>
            <ul class="words" aria-hidden="true">
              <li class="word">
                <span class="hanzi word__zh">爱护</span>
                <span class="pinyin">ài hù</span>
                <span class="word__en">{{ t('mockMeaningAihu') }}</span>
                <span class="word__date">{{ t('mockDateA') }}</span>
              </li>
              <li class="word">
                <span class="hanzi word__zh">学习</span>
                <span class="pinyin">xué xí</span>
                <span class="word__en">{{ t('mockMeaningXuexi') }}</span>
                <span class="word__date">{{ t('mockDateB') }}</span>
              </li>
              <li class="word">
                <span class="hanzi word__zh">朋友</span>
                <span class="pinyin">péng you</span>
                <span class="word__en">{{ t('mockMeaningPengyou') }}</span>
                <span class="word__date">{{ t('mockDateC') }}</span>
              </li>
            </ul>
          </figure>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.ways { display: flex; flex-direction: column; gap: var(--s-12); }

.split { display: grid; gap: var(--s-8); align-items: start; }
.split__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }

/* The mock sits alone on the paper, like the email. */
.stage { display: flex; justify-content: center; min-width: 0; }


/* ---------- Mock screens. Same look as the mock email. ---------- */
.mock {
  margin: 0;
  min-width: 0;
  width: 100%;
  max-width: 26rem;
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  pointer-events: none;
  user-select: none;
}
.mock__bar { display: flex; align-items: baseline; gap: var(--s-3); padding: var(--s-2) var(--s-4); background-color: var(--c-sunk); border-bottom: var(--bw-rule) solid var(--c-ink); }
.mock__bar--split { justify-content: space-between; align-items: center; }
.mock__barword { font-size: var(--t-lead); font-weight: var(--w-bold); }
.mock__title { font-family: var(--f-ui); font-weight: var(--w-semi); color: var(--c-ink); }
.mock__body { display: flex; flex-direction: column; gap: var(--s-2); padding: var(--s-4); }
.mock__prompt { font-size: var(--t-base); color: var(--c-muted); }
.mock__word { font-size: var(--t-2xl); line-height: var(--lh-tight); font-weight: var(--w-bold); }
.mock__gloss { color: var(--c-body); font-size: var(--t-base); }

/* Quiz options. A wrong guess first (red, a shake, a cross), then the right
 * answer (ink, a tick). The right answer's resting style is the chosen one, so
 * reduced motion shows only the right answer picked. */
.opts { list-style: none; margin: var(--s-2) 0 0; padding: 0; display: grid; gap: var(--s-2); }
.opt { position: relative; padding: var(--s-2) var(--s-3); padding-right: var(--s-8); border: var(--bw-rule) solid var(--c-ink); background-color: var(--c-panel); color: var(--c-ink); font-size: var(--t-base); line-height: var(--lh-snug); }
.opt::after { position: absolute; right: var(--s-3); top: 50%; transform: translateY(-50%); font-weight: var(--w-bold); opacity: 0; }
.opt--wrong { animation: miss 9s ease-in-out infinite; }
.opt--wrong::after { content: '✗'; animation: miss-mark 9s ease-in-out infinite; }
.opt--right {
  background-color: var(--c-ink);
  color: var(--c-on-button);
  box-shadow: var(--shadow-hard-soft);
  animation: pick 9s ease-in-out infinite;
}
.opt--right::after { content: '✓'; opacity: 1; animation: pick-mark 9s ease-in-out infinite; }
@keyframes miss {
  0%, 14% { background-color: var(--c-panel); color: var(--c-ink); border-color: var(--c-ink); transform: none; }
  17% { background-color: var(--c-red-solid); color: var(--c-on-red); border-color: var(--c-red-solid); transform: translateX(-4px); }
  19% { transform: translateX(4px); }
  21% { transform: translateX(-3px); }
  23% { transform: translateX(2px); }
  25%, 38% { background-color: var(--c-red-solid); color: var(--c-on-red); border-color: var(--c-red-solid); transform: none; }
  44%, 100% { background-color: var(--c-panel); color: var(--c-ink); border-color: var(--c-ink); }
}
@keyframes miss-mark {
  0%, 15% { opacity: 0; }
  17%, 38% { opacity: 1; }
  44%, 100% { opacity: 0; }
}
@keyframes pick {
  0%, 48% { background-color: var(--c-panel); color: var(--c-ink); box-shadow: none; }
  53%, 92% { background-color: var(--c-ink); color: var(--c-on-button); box-shadow: var(--shadow-hard-soft); }
  100% { background-color: var(--c-panel); color: var(--c-ink); box-shadow: none; }
}
@keyframes pick-mark {
  0%, 50% { opacity: 0; }
  53%, 92% { opacity: 1; }
  100% { opacity: 0; }
}

/* Example sentence: the word is marked, and the mark sweeps in. */
.mock__sentence { font-size: var(--t-md); line-height: var(--lh-snug); }
.hit {
  color: var(--c-seal);
  background: linear-gradient(var(--c-seal), var(--c-seal)) no-repeat 0 100% / 100% 2px;
  animation: sweep 6s ease-in-out infinite;
}
.hit--latin { background: none; animation: none; font-weight: var(--w-semi); }
/* The English meaning: red and semibold like the pinyin, no underline or motion. */
.hit--plain { background: none; animation: none; font-weight: var(--w-semi); }
@keyframes sweep {
  0%, 15% { background-size: 0 2px; }
  35%, 90% { background-size: 100% 2px; }
  100% { background-size: 0 2px; }
}

/* Review list. */
.words { list-style: none; margin: 0; padding: 0; }
.word { display: grid; grid-template-columns: 4rem 5rem minmax(0, 1fr) auto; align-items: baseline; gap: var(--s-2); padding: var(--s-3) var(--s-4); border-top: var(--bw-hair) solid var(--c-rule); }
.word:first-child { border-top: 0; }
.word__zh { font-size: var(--t-md); font-weight: var(--w-bold); }
.word__en { color: var(--c-body); font-size: var(--t-base); }
.word__date { color: var(--c-muted); font-size: var(--t-sm); white-space: nowrap; }
.export {
  padding: var(--s-1) var(--s-3);
  background-color: var(--c-raised);
  color: var(--c-ink);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  font-family: var(--f-ui);
  font-size: var(--t-base);
  font-weight: var(--w-semi);
  animation: press 6s ease-in-out infinite;
}
@keyframes press {
  0%, 62%, 78%, 100% { transform: none; box-shadow: var(--shadow-hard); }
  68%, 72% { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--c-ink); }
}

/* Sentence box: the learner types, one character at a time. */
.field { min-height: 6rem; padding: var(--s-3); border: var(--bw-rule) solid var(--c-ink); background-color: var(--c-panel); }
.field__text { font-size: var(--t-md); line-height: var(--lh-snug); }
.field__typed {
  display: inline-block;
  vertical-align: bottom;
  overflow: hidden;
  white-space: nowrap;
  width: 7em;
  border-right: 2px solid var(--c-seal);
  animation: type 8s steps(7, end) infinite;
}
@keyframes type {
  0% { width: 0; }
  50%, 92% { width: 7em; }
  100% { width: 0; }
}

/* Practice grid (田字格) with a character and a photo upload. */
.mock__body--write { align-items: center; gap: var(--s-4); }
.grid {
  position: relative;
  display: grid;
  place-items: center;
  width: 9rem;
  aspect-ratio: 1;
  border: var(--bw-rule) solid var(--c-ink);
  background-color: var(--c-panel);
  background-image:
    linear-gradient(to right, transparent calc(50% - 0.5px), var(--c-seal) calc(50% - 0.5px), var(--c-seal) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
    linear-gradient(to bottom, transparent calc(50% - 0.5px), var(--c-seal) calc(50% - 0.5px), var(--c-seal) calc(50% + 0.5px), transparent calc(50% + 0.5px));
  background-size: 100% 100%;
}
.grid::before,
.grid::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.45; }
.grid::before { background: linear-gradient(to bottom right, transparent calc(50% - 0.5px), var(--c-seal) calc(50% - 0.5px), var(--c-seal) calc(50% + 0.5px), transparent calc(50% + 0.5px)); }
.grid::after { background: linear-gradient(to top right, transparent calc(50% - 0.5px), var(--c-seal) calc(50% - 0.5px), var(--c-seal) calc(50% + 0.5px), transparent calc(50% + 0.5px)); }
.grid__char { position: relative; z-index: 1; font-size: 5.5rem; line-height: 1; color: var(--c-ink); animation: draw 7s ease-in-out infinite; }
@keyframes draw {
  0%, 10% { opacity: 0.12; }
  45%, 90% { opacity: 1; }
  100% { opacity: 0.12; }
}
.upload { display: inline-flex; align-items: center; gap: var(--s-2); padding: var(--s-1) var(--s-3); border: var(--bw-rule) solid var(--c-ink); background-color: var(--c-raised); font-family: var(--f-ui); font-size: var(--t-base); font-weight: var(--w-semi); color: var(--c-ink); }
.upload__icon { position: relative; width: 1rem; height: 0.75rem; border: var(--bw-rule) solid var(--c-ink); }
.upload__icon::after { content: ''; position: absolute; inset: 1px; margin: auto; width: 0.3rem; height: 0.3rem; border-radius: var(--r-circle); background-color: var(--c-seal); }

/* Still pictures for people who ask for less motion: the final state of each. */
@media (prefers-reduced-motion: reduce) {
  .opt--right,
  .opt--right::after,
  .opt--wrong,
  .opt--wrong::after,
  .hit,
  .export,
  .field__typed,
  .grid__char { animation: none; }
  .hit:not(.hit--latin) { background-size: 100% 2px; }
}

@media (min-width: 720px) {
  .split { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); }
  /* Every other section swaps sides: the mock moves left, the text right. */
  .split--flip { grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr); }
  .split--flip .split__text { order: 2; }
}

/* Thin horizontal strip cropped from the tiger print, on the tiger's eyes and the
 * patterned robe. Deeper on a phone, where
 * 8:1 would be a sliver. */
.strip :deep(.print__frame) { aspect-ratio: 8 / 1; }
.strip :deep(.print__img) { object-position: center 60%; }
@media (max-width: 719px) {
  .strip :deep(.print__frame) { aspect-ratio: 4 / 1 !important; }
}
</style>
