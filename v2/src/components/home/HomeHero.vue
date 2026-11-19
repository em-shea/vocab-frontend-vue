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
      ratio="4 / 5"
      class="quest__print"
      :src="printQuest"
      alt="Woodblock print of a bearded warrior in patterned robes, a long weapon held to his mouth"
    />
  </section>
</template>

<style scoped>
.quest { display: grid; gap: var(--s-6); align-items: center; }
.quest__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }
.quest__kicker { font-family: var(--f-brush); font-weight: var(--w-body); font-size: var(--t-md); letter-spacing: 0.02em; color: var(--c-seal); }
.quest__headline { font-size: var(--t-xl); }
.quest__body { font-size: var(--t-lead); }
.quest__form { margin-top: var(--s-2); }
.quest__print { max-width: 420px; width: 100%; justify-self: center; }

@media (min-width: 720px) {
  .quest { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); }
  .quest__headline { font-size: var(--t-4xl); }
}
</style>
