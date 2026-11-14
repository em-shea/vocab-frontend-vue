<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import SiteNav from '../components/SiteNav.vue'
import SectionHead from '../components/SectionHead.vue'
import AppPanel from '../components/AppPanel.vue'
import PrintFrame from '../components/PrintFrame.vue'
import ScrollRods from '../components/ScrollRods.vue'
import SubscribeForm from '../components/SubscribeForm.vue'
import WordCard from '../components/WordCard.vue'

import { useVocabListsStore } from '../stores/vocabLists'

// Placeholder artwork: Kuniyoshi's One Hundred and Eight Heroes of the Popular
// Water Margin, public domain, standing in until licensed or original prints
// exist. See src/assets/prints/README.md.
import printQuest from '../assets/prints/hero-quest.jpg'
import printCollect from '../assets/prints/hero-collect.jpg'
import printBoard from '../assets/prints/heroes-board.jpg'

// The home page walks through the experience in the order a subscriber lives it:
// subscribe, choose what to study, receive the daily email, study, collect heroes,
// then the closing band with the second subscribe form.

const { t } = useI18n()
const lists = useVocabListsStore()

const openLevel = ref(null)

onMounted(async () => {
  await lists.load()
  openLevel.value = lists.all[0]?.list_id ?? null
})

// The source credit shared by every print on the page. The facts are the ones
// recorded in src/assets/prints/README.md and nothing more: which hero each
// print shows is not recorded, so none is named.
const credit = computed(() => t('printCredit'))
</script>

<template>
  <div class="page">
    <ScrollRods position="top" />

    <div class="page__inner">
      <SiteNav />

      <!-- 1. Top: headline and the subscribe form -->
      <section class="quest">
        <div class="quest__text">
          <p class="quest__kicker">{{ t('questKicker') }}</p>
          <h1 class="quest__headline">
            {{ t('questHeadlineA') }}<br />{{ t('questHeadlineB') }}
          </h1>
          <p class="quest__body">{{ t('questBody') }}</p>
          <SubscribeForm variant="light" class="quest__form" />
        </div>
        <PrintFrame
          ratio="4 / 5"
          class="quest__print"
          :src="printQuest"
          alt="Woodblock print of a bearded warrior in patterned robes, a long weapon held to his mouth"
          :caption="credit"
        />
      </section>

      <!-- 2. Choose what to study -->
      <section class="stack">
        <SectionHead :title="t('chooseHeadline')" />

        <div class="way">
          <h3>{{ t('levelHeadline') }}</h3>
          <p>{{ t('levelBody') }}</p>

          <div class="levels" role="tablist">
            <button
              v-for="list in lists.all"
              :key="list.list_id"
              type="button"
              role="tab"
              class="levels__tab"
              :class="{ 'levels__tab--on': openLevel === list.list_id }"
              :aria-selected="openLevel === list.list_id"
              @click="openLevel = list.list_id"
            >
              {{ list.list_name }}
            </button>
          </div>

          <div v-if="lists.loading" class="samples samples--empty">
            <p class="muted">Loading sample words…</p>
          </div>
          <div v-else-if="lists.error" class="samples samples--empty">
            <p class="muted">Sample words are unavailable right now.</p>
          </div>
          <div v-else class="samples">
            <WordCard
              v-for="entry in lists.samplesFor(openLevel)"
              :key="entry.word_id"
              :word="entry.word"
              compact
            />
          </div>
        </div>

        <div class="ways">
          <div class="way">
            <h3>{{ t('catalogueHeadline') }}</h3>
            <p class="soon">{{ t('launchingSoon') }}</p>
            <p>{{ t('catalogueBody') }}</p>
          </div>
          <div class="way">
            <h3>{{ t('uploadHeadline') }}</h3>
            <p class="soon">{{ t('launchingSoon') }}</p>
            <p>{{ t('uploadBody') }}</p>
          </div>
        </div>
      </section>

      <!-- 3. The daily email, as an example -->
      <section class="split split--mail">
        <div class="split__text">
          <SectionHead :title="t('dailyHeadline')" />
          <p>{{ t('dailyBody') }}</p>
        </div>

        <figure class="mail" :aria-label="t('emailLabel')">
          <div class="mail__bar">
            <p class="mail__subject">{{ t('emailSubject') }}</p>
          </div>
          <div class="mail__body">
            <p class="hanzi mail__word">爱护</p>
            <p class="pinyin mail__pinyin">ài hù</p>
            <p class="mail__meaning">{{ t('emailMeaning') }}</p>
            <div class="mail__example">
              <p class="hanzi mail__sentence">我们要爱护环境。</p>
              <p class="pinyin">Wǒmen yào àihù huánjìng.</p>
              <p class="mail__translation">{{ t('emailTranslation') }}</p>
            </div>
          </div>
        </figure>
      </section>

      <!-- 4. Study -->
      <section class="stack">
        <SectionHead :title="t('studyHeadline')" />
        <ul class="study">
          <li class="study__item">
            <h3>{{ t('quizHeadline') }}</h3>
            <p>{{ t('quizBody') }}</p>
          </li>
          <li class="study__item">
            <h3>{{ t('sentenceHeadline') }}</h3>
            <p class="soon">{{ t('launchingSoon') }}</p>
            <p>{{ t('sentenceBody') }}</p>
          </li>
          <li class="study__item">
            <h3>{{ t('writeHeadline') }}</h3>
            <p class="soon">{{ t('launchingSoon') }}</p>
            <p>{{ t('writeBody') }}</p>
          </li>
        </ul>
      </section>

      <!-- 5. Collect heroes, with the story of the 108 -->
      <section class="split split--reverse">
        <div class="split__text">
          <SectionHead :title="t('collectHeadline')" />
          <p>{{ t('collectBody') }}</p>
          <p>{{ t('storyBody') }}</p>
        </div>

        <PrintFrame
          ratio="4 / 5"
          class="split__print hero"
          :src="printCollect"
          alt=""
          :caption="credit"
        >
          <div class="hero__stage">
            <div class="hero__sprite" aria-hidden="true"></div>
            <div class="hero__plate">
              <p class="brush hero__name">{{ t('heroName') }}</p>
              <p class="pinyin hero__pinyin">{{ t('heroPinyin') }}</p>
              <p class="hero__nick">
                <span class="brush">{{ t('heroNickname') }}</span>
                <span>{{ t('heroNicknameGloss') }}</span>
              </p>
            </div>
          </div>
        </PrintFrame>
      </section>

      <!-- 6. Quests and the closing band -->
      <section class="stack">
        <AppPanel band class="oath">
          <h2 class="oath__headline">
            {{ t('closeHeadlineA') }}<br />{{ t('closeHeadlineB') }}
          </h2>
          <p class="soon soon--band">{{ t('launchingSoon') }}</p>
          <p class="oath__body">{{ t('closeBody') }}</p>
          <figure class="oath__board">
            <img :src="printBoard" alt="Two outlaws of the Water Margin, woodblock print" />
            <figcaption class="oath__caption">{{ credit }}</figcaption>
          </figure>
          <SubscribeForm variant="band" />
        </AppPanel>
      </section>
    </div>

    <ScrollRods position="bottom" />
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--s-6); min-height: 100vh; padding: var(--s-4) 0; }

.page__inner {
  display: flex;
  flex-direction: column;
  gap: var(--s-24);
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--s-4);
}

.stack { display: flex; flex-direction: column; gap: var(--s-6); }
.muted { color: var(--c-muted); }

/* Marks a feature that is not built yet. Plain sentence-case text with a thin
 * square outline: no uppercase, no tracking, no badge shape. */
.soon {
  align-self: flex-start;
  padding: var(--s-1) var(--s-2);
  border: var(--bw-hair) solid var(--c-rule);
  font-size: var(--t-base);
  color: var(--c-muted);
}
.soon--band { border-color: var(--c-rule-gold); color: var(--c-on-dark); }

/* --- 1. top --- */
.quest { display: grid; gap: var(--s-6); align-items: center; }
.quest__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }
.quest__kicker { font-family: var(--f-brush); font-weight: var(--w-body); font-size: var(--t-md); letter-spacing: 0.02em; color: var(--c-seal); }
.quest__headline { font-size: var(--t-xl); }
.quest__body { font-size: var(--t-lead); }
.quest__form { margin-top: var(--s-2); }
.quest__print { max-width: 420px; width: 100%; justify-self: center; }

/* --- text beside a print or an illustration --- */
.split { display: grid; gap: var(--s-8); align-items: start; }
.split__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }
.split__print { max-width: 420px; width: 100%; justify-self: center; }

/* --- 2. choose what to study --- */
.way { display: flex; flex-direction: column; gap: var(--s-3); align-items: flex-start; min-width: 0; }
.way > .levels, .way > .samples { align-self: stretch; }
.way h3, .study__item h3 { font-size: var(--t-lg); }
.ways { display: grid; gap: var(--s-8); }

.levels { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-top: var(--s-2); }
.levels__tab {
  padding: var(--s-2) var(--s-4);
  background-color: var(--c-panel);
  border: var(--bw-hair) solid var(--c-rule);
  border-radius: var(--r-pill);
  font-family: var(--f-label);
  font-size: var(--t-base);
  color: var(--c-body);
  cursor: pointer;
}
.levels__tab--on { background-color: var(--c-ink); border-color: var(--c-ink); color: var(--c-on-dark); }

.samples { display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); margin-top: var(--s-2); }
.samples--empty { display: block; }

/* --- 3. the example email --- */
.mail {
  margin: 0;
  min-width: 0;
  max-width: 30rem;
  width: 100%;
  justify-self: center;
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.mail__bar { padding: var(--s-3) var(--s-4); background-color: var(--c-sunk); border-bottom: var(--bw-rule) solid var(--c-ink); }
.mail__subject { font-family: var(--f-ui); font-weight: var(--w-semi); color: var(--c-ink); overflow-wrap: anywhere; }
.mail__body { display: flex; flex-direction: column; gap: var(--s-2); padding: var(--s-6); }
.mail__word { font-size: var(--t-3xl); line-height: var(--lh-tight); font-weight: var(--w-bold); color: var(--c-ink); }
.mail__pinyin { font-size: var(--t-lead); }
.mail__meaning { color: var(--c-body); }
.mail__example {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  margin-top: var(--s-3);
  padding-top: var(--s-3);
  border-top: var(--bw-hair) solid var(--c-rule);
}
.mail__sentence { font-size: var(--t-lg); color: var(--c-ink); }
.mail__translation { color: var(--c-body); }

/* --- 4. study --- */
.study { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-6); }
.study__item { display: flex; flex-direction: column; gap: var(--s-2); padding-top: var(--s-3); border-top: var(--bw-heavy) solid var(--c-ink); }

/* --- 5. the hero card --- */
.hero__stage {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}
/* A 64px frame drawn at 3x: the sheet is four frames side by side, so the
 * element shows one 192px frame and the animation steps the sheet across it. */
.hero__sprite {
  flex: 0 0 auto;
  width: 192px;
  height: 192px;
  margin-bottom: var(--s-2);
  background-image: url('../assets/sprites/lu-zhishen.png');
  background-size: 768px 192px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  animation: hero-idle 0.8s steps(4) infinite;
}
@keyframes hero-idle {
  from { background-position: 0 0; }
  to { background-position: -768px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hero__sprite { animation: none; }
}
.hero__plate {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-4);
  background-color: var(--c-panel);
  border-top: var(--bw-rule) solid var(--c-ink);
}
.hero__name { font-size: var(--t-xl); line-height: var(--lh-tight); color: var(--c-ink); }
.hero__pinyin { font-size: var(--t-base); }
.hero__nick { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2); color: var(--c-body); font-size: var(--t-base); }
.hero__nick .brush { font-size: var(--t-lg); color: var(--c-seal); }

/* --- 6. the closing band --- */
.oath { gap: var(--s-6); }
.oath__headline { font-size: var(--t-2xl); color: var(--c-on-dark); }
.oath__body { color: var(--c-on-dark); opacity: 0.85; }
.oath__board {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  /* Same square ink frame as the prints, lightened for the dark band. */
  border: var(--bw-frame) solid var(--c-on-dark);
  border-radius: 0;
  padding: var(--s-3);
  overflow: hidden;
}
.oath__board img {
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  object-position: center 22%;
  filter: sepia(0.2) saturate(0.9);
}
.oath__caption {
  font-size: var(--t-sm);
  line-height: var(--lh-snug);
  color: var(--c-on-dark);
  opacity: 0.85;
  overflow-wrap: anywhere;
}

@media (min-width: 720px) {
  .page__inner { padding: 0 var(--s-14); }
  .quest { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); }
  .quest__headline { font-size: var(--t-4xl); }
  .split { grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr); }
  .split--mail { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); }
  .split--reverse { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); }
  .split--reverse .split__print { order: -1; }
  .ways { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .study { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
