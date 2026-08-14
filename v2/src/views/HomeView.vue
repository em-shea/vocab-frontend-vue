<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import SiteNav from '../components/SiteNav.vue'
import SectionHead from '../components/SectionHead.vue'
import AppPanel from '../components/AppPanel.vue'
import AppButton from '../components/AppButton.vue'
import PrintFrame from '../components/PrintFrame.vue'
import ScrollRods from '../components/ScrollRods.vue'
import SubscribeForm from '../components/SubscribeForm.vue'
import WordCard from '../components/WordCard.vue'
import AudioButton from '../components/AudioButton.vue'

import { useVocabListsStore } from '../stores/vocabLists'

// Placeholder artwork: Kuniyoshi's One Hundred and Eight Heroes of the Popular
// Water Margin, public domain, standing in until licensed or original prints
// exist. See src/assets/prints/README.md.
import printQuest from '../assets/prints/hero-quest.jpg'
import printStory from '../assets/prints/hero-story.jpg'
import printCollect from '../assets/prints/hero-collect.jpg'
import printBoard from '../assets/prints/heroes-board.jpg'

// The 5a home page: seven sections, prints and text alternating sides.

const { t } = useI18n()
const lists = useVocabListsStore()

const openLevel = ref(null)

onMounted(async () => {
  await lists.load()
  openLevel.value = lists.all[0]?.list_id ?? null
})

// The daily-word card uses a real sample from the chosen level rather than a
// hardcoded word, so it shows what a subscriber would actually receive.
const featured = computed(() => {
  const sample = lists.samplesFor(openLevel.value ?? lists.all[0]?.list_id)
  return sample[0]?.word ?? null
})

const beats = computed(() => [t('beat1'), t('beat2'), t('beat3')])
</script>

<template>
  <div class="page">
    <ScrollRods position="top" />

    <div class="page__inner">
      <SiteNav />

      <!-- 1. Quest -->
      <section class="quest">
        <div class="quest__text">
          <p class="label quest__kicker">{{ t('questKicker') }}</p>
          <h1 class="quest__headline">
            {{ t('questHeadlineA') }}<br />{{ t('questHeadlineB') }}
          </h1>
          <p class="quest__body">{{ t('questBody') }}</p>
          <div class="quest__actions">
            <AppButton variant="seal" as="a" href="#subscribe">{{ t('questCta') }}</AppButton>
            <p class="quest__note">{{ t('questNote') }}</p>
          </div>
        </div>
        <PrintFrame
          ratio="4 / 5"
          class="quest__print"
          :src="printQuest"
          alt="Woodblock print of a Liangshan outlaw seated with a long staff"
        />
      </section>

      <!-- 2. Subscribe band -->
      <section id="subscribe" class="stack">
        <SectionHead label="subscribe" :title="t('subscribeLine')" />
        <AppPanel>
          <SubscribeForm variant="light" />
        </AppPanel>
      </section>

      <!-- 3. The story — print on the right -->
      <section class="split">
        <div class="split__text">
          <SectionHead :label="t('markStory')" :title="t('storyHeadline')" />
          <p class="split__kicker hanzi">{{ t('storyKicker') }}</p>
          <p>{{ t('storyBody') }}</p>
          <p>{{ t('storyBody2') }}</p>
        </div>
        <PrintFrame
          ratio="3 / 4"
          class="split__print"
          :src="printStory"
          alt="Woodblock print of an outlaw of the Water Margin in armour"
        />
      </section>

      <!-- 4. Daily word -->
      <section class="stack">
        <SectionHead :label="t('markHow')" :title="t('dailyHeadline')" hanzi="每日一词" />
        <div class="daily">
          <WordCard
            v-if="featured"
            :word="featured"
            :level="lists.byId(openLevel)?.list_name ?? ''"
          />
          <AppPanel v-else framed>
            <p class="muted">{{ t('dailyBody') }}</p>
          </AppPanel>

          <div class="daily__beats">
            <p class="daily__body">{{ t('dailyBody') }}</p>
            <ol class="beats">
              <li v-for="(beat, i) in beats" :key="beat" class="beats__item">
                <span class="beats__n mono">{{ i + 1 }}</span>
                <span>{{ beat }}</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <!-- 5. Levels -->
      <section class="stack">
        <SectionHead :label="t('markLevels')" :title="t('levelHeadline')" />
        <p class="note">{{ t('levelBody') }}</p>

        <p class="levels__prompt">{{ t('whichLevel') }}</p>
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

        <p class="note">
          {{ t('clickPre') }}<a href="/review">{{ t('recentWords') }}</a>{{ t('clickPost') }}
        </p>

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

        <div class="levels__own">
          <AppButton variant="quiet" as="a" href="/manage-lists">{{ t('uploadOwn') }}</AppButton>
        </div>
      </section>

      <!-- 6. Heroes -->
      <section class="split split--reverse">
        <PrintFrame
          ratio="1 / 1"
          class="split__print"
          :src="printCollect"
          alt="Woodblock print of a tattooed hero wrestling an opponent"
        />
        <div class="split__text">
          <SectionHead :label="t('markHeroes')" :title="t('collectHeadline')" hanzi="一百零八" />
          <p>{{ t('collectBody') }}</p>
          <AppPanel class="hero-card">
            <p class="label">{{ t('abilityLabel') }}</p>
            <p class="hanzi hero-card__name">{{ t('abilityName') }}</p>
            <p class="hero-card__note">{{ t('abilityNote') }}</p>
          </AppPanel>
        </div>
      </section>

      <!-- 7. Oath — dark band -->
      <section class="stack">
        <SectionHead :label="t('markJoin')" :title="t('closeHeadlineA')" />
        <AppPanel band class="oath">
          <h2 class="oath__headline">
            {{ t('closeHeadlineA') }}<br />{{ t('closeHeadlineB') }}
          </h2>
          <p class="oath__body">{{ t('closeBody') }}</p>
          <figure class="oath__board">
            <img :src="printBoard" alt="Two outlaws of the Water Margin, woodblock print" />
            <figcaption class="oath__board-note label">{{ t('boardNote') }}</figcaption>
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
.note { color: var(--c-muted); }
.muted { color: var(--c-muted); }

/* --- 1. quest --- */
.quest { display: grid; gap: var(--s-8); align-items: center; }
.quest__text { display: flex; flex-direction: column; gap: var(--s-4); }
.quest__kicker { font-family: var(--f-hanzi); letter-spacing: var(--ls-tight); color: var(--c-seal); }
.quest__headline { font-size: var(--t-3xl); }
.quest__body { font-size: var(--t-lead); }
.quest__actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }
.quest__note { font-size: var(--t-base); color: var(--c-muted); }
.quest__print { max-width: 420px; width: 100%; justify-self: center; }

/* --- alternating text/print sections --- */
.split { display: grid; gap: var(--s-8); align-items: start; }
.split__text { display: flex; flex-direction: column; gap: var(--s-4); }
.split__kicker { color: var(--c-seal); font-size: var(--t-lead); }
.split__print { max-width: 420px; width: 100%; justify-self: center; }

/* --- 4. daily --- */
.daily { display: grid; gap: var(--s-6); align-items: start; }
.daily__beats { display: flex; flex-direction: column; gap: var(--s-4); }
.daily__body { color: var(--c-body); }

.beats { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-3); }
.beats__item {
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
  padding-bottom: var(--s-3);
  border-bottom: var(--bw-hair) solid var(--c-rule);
  color: var(--c-ink);
}
.beats__n {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  background-color: var(--c-seal);
  color: var(--c-on-red);
  border-radius: var(--r-circle);
  font-size: var(--t-sm);
}

/* --- 5. levels --- */
.levels__prompt { font-family: var(--f-display); font-weight: var(--w-heavy); color: var(--c-ink); font-size: var(--t-lg); }
.levels { display: flex; flex-wrap: wrap; gap: var(--s-2); }
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

.samples { display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); }
.samples--empty { display: block; }
.levels__own { display: flex; }

/* --- 6. heroes --- */
.hero-card { gap: var(--s-2); }
.hero-card__name { font-size: var(--t-xl); font-weight: var(--w-bold); }
.hero-card__note { font-size: var(--t-base); color: var(--c-muted); }

/* --- 7. oath --- */
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
.oath__board-note { color: var(--c-gold); }

@media (min-width: 720px) {
  .page__inner { padding: 0 var(--s-14); }
  .quest { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); }
  .split { grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr); }
  .split--reverse { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); }
  .daily { grid-template-columns: minmax(0, 22rem) minmax(0, 1fr); }
  .quest__headline { font-size: var(--t-4xl); }
}
</style>
