<script setup>
import { useI18n } from 'vue-i18n'
import PrintFrame from '../PrintFrame.vue'
import SubscribeForm from '../SubscribeForm.vue'
import printQuest from '../../assets/prints/hero-quest.jpg'

// The top of the page: headline, intro, the subscribe form, and a print. The
// form comes before the print in the markup so it is reachable on a phone.
// `heroes` is the full-game version (brush line, climb headline); the launch
// version leads with the daily word.
defineProps({ heroes: { type: Boolean, default: false } })
const { t } = useI18n()
</script>

<template>
  <section class="quest">
    <div class="quest__text">
      <template v-if="heroes">
        <p class="quest__kicker">{{ t('questKicker') }}</p>
        <h1 class="quest__headline">
          {{ t('questHeadlineA') }}<br />{{ t('questHeadlineB') }}
        </h1>
        <p class="quest__body">{{ t('questBody') }}</p>
      </template>
      <template v-else>
        <h1 class="quest__headline">{{ t('launchHeadline') }}</h1>
        <p class="quest__body">{{ t('launchBody') }}</p>
      </template>
      <SubscribeForm variant="light" class="quest__form" />
    </div>
    <PrintFrame
      ratio="auto"
      class="quest__print"
      :src="printQuest"
      alt="Woodblock print of a bearded warrior in patterned robes, a long weapon held to his mouth"
    />
  </section>
</template>

<style scoped>
.quest { display: grid; gap: var(--s-6); align-items: stretch; }
.quest__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }
.quest__kicker { font-family: var(--f-brush); font-weight: var(--w-body); font-size: var(--t-md); letter-spacing: 0.02em; color: var(--c-seal); }
.quest__headline { font-size: var(--t-xl); }
.quest__body { font-size: var(--t-lead); }
.quest__form { margin-top: var(--s-2); }
/* The print is cropped to fit (Emily, 2026-11-22): on a phone it is as wide as
   the Subscribe button above it, in a landscape crop on the warrior's face;
   on a wide screen it is as tall as the headline and form beside it. */
.quest__print { width: 100%; }
.quest__print :deep(.print__frame) { aspect-ratio: 3 / 2; }
.quest__print :deep(.print__img) { object-position: 50% 22%; }

@media (min-width: 720px) {
  .quest { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); }
  .quest__print { height: 100%; }
  .quest__print :deep(.print__frame) { aspect-ratio: auto; height: 100%; }
  .quest__print :deep(.print__img) { position: absolute; inset: 0; object-position: 50% 30%; }
  .quest__headline { font-size: var(--t-4xl); }
}
</style>
